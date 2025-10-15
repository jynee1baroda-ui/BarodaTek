/**
 * Simple JSON-based Database with Real Persistence
 * Works perfectly with Vercel (no external database needed)
 * Data persists between deployments via file system
 */

const fs = require('fs').promises;
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const CONTRACTS_DB = path.join(DB_DIR, 'contracts.json');
const REVIEWS_DB = path.join(DB_DIR, 'reviews.json');
const ANALYTICS_DB = path.join(DB_DIR, 'analytics.json');
const USERS_DB = path.join(DB_DIR, 'users.json');
const SESSIONS_DB = path.join(DB_DIR, 'sessions.json');
const ERRORS_DB = path.join(DB_DIR, 'errors.json');

// Initialize database
async function initDatabase() {
    try {
        // Create data directory if it doesn't exist
        try {
            await fs.access(DB_DIR);
        } catch {
            await fs.mkdir(DB_DIR, { recursive: true });
            console.log('📁 Created data directory');
        }

        // Initialize empty databases if they don't exist
        const databases = {
            [CONTRACTS_DB]: [],
            [REVIEWS_DB]: [],
            [ANALYTICS_DB]: {
                pageViews: 0,
                uniqueVisitors: 0,
                totalSessions: 0,
                events: [],
                topPages: [],
                lastUpdated: new Date().toISOString()
            },
            [USERS_DB]: [],
            [SESSIONS_DB]: [],
            [ERRORS_DB]: []
        };

        for (const [dbPath, defaultData] of Object.entries(databases)) {
            try {
                await fs.access(dbPath);
            } catch {
                await fs.writeFile(dbPath, JSON.stringify(defaultData, null, 2));
                console.log(`✅ Initialized ${path.basename(dbPath)}`);
            }
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// Generic read function
async function readDB(dbPath) {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${path.basename(dbPath)}:`, error);
        return Array.isArray(dbPath) ? [] : {};
    }
}

// Generic write function
async function writeDB(dbPath, data) {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${path.basename(dbPath)}:`, error);
        return false;
    }
}

// ========== CONTRACTS CRUD ==========

async function getAllContracts(filters = {}) {
    const contracts = await readDB(CONTRACTS_DB);
    let filtered = contracts;

    // Apply filters
    if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.client) {
        filtered = filtered.filter(c => 
            c.client.toLowerCase().includes(filters.client.toLowerCase())
        );
    }

    return filtered;
}

async function getContractById(id) {
    const contracts = await readDB(CONTRACTS_DB);
    return contracts.find(c => c.id === parseInt(id));
}

async function createContract(contractData) {
    const contracts = await readDB(CONTRACTS_DB);
    
    const newContract = {
        id: contracts.length > 0 ? Math.max(...contracts.map(c => c.id)) + 1 : 1,
        ...contractData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    contracts.push(newContract);
    await writeDB(CONTRACTS_DB, contracts);
    
    return newContract;
}

async function updateContract(id, updates) {
    const contracts = await readDB(CONTRACTS_DB);
    const index = contracts.findIndex(c => c.id === parseInt(id));
    
    if (index === -1) return null;

    contracts[index] = {
        ...contracts[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await writeDB(CONTRACTS_DB, contracts);
    return contracts[index];
}

async function deleteContract(id) {
    const contracts = await readDB(CONTRACTS_DB);
    const filtered = contracts.filter(c => c.id !== parseInt(id));
    
    if (filtered.length === contracts.length) return false;

    await writeDB(CONTRACTS_DB, filtered);
    return true;
}

// ========== REVIEWS CRUD ==========

async function getAllReviews(filters = {}) {
    const reviews = await readDB(REVIEWS_DB);
    let filtered = reviews;

    if (filters.approved !== undefined) {
        filtered = filtered.filter(r => r.approved === filters.approved);
    }
    if (filters.rating) {
        filtered = filtered.filter(r => r.rating >= parseInt(filters.rating));
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getReviewById(id) {
    const reviews = await readDB(REVIEWS_DB);
    return reviews.find(r => r.id === parseInt(id));
}

async function createReview(reviewData) {
    const reviews = await readDB(REVIEWS_DB);
    
    const newReview = {
        id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
        ...reviewData,
        approved: false, // Reviews need approval by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    reviews.push(newReview);
    await writeDB(REVIEWS_DB, reviews);
    
    return newReview;
}

async function updateReview(id, updates) {
    const reviews = await readDB(REVIEWS_DB);
    const index = reviews.findIndex(r => r.id === parseInt(id));
    
    if (index === -1) return null;

    reviews[index] = {
        ...reviews[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    await writeDB(REVIEWS_DB, reviews);
    return reviews[index];
}

async function deleteReview(id) {
    const reviews = await readDB(REVIEWS_DB);
    const filtered = reviews.filter(r => r.id !== parseInt(id));
    
    if (filtered.length === reviews.length) return false;

    await writeDB(REVIEWS_DB, filtered);
    return true;
}

async function approveReview(id) {
    return await updateReview(id, { approved: true });
}

// ========== ANALYTICS CRUD ==========

async function getAnalytics() {
    return await readDB(ANALYTICS_DB);
}

async function trackPageView(pageData) {
    const analytics = await readDB(ANALYTICS_DB);
    
    analytics.pageViews++;
    analytics.lastUpdated = new Date().toISOString();

    // Track page in topPages
    const pageIndex = analytics.topPages.findIndex(p => p.path === pageData.path);
    if (pageIndex >= 0) {
        analytics.topPages[pageIndex].views++;
    } else {
        analytics.topPages.push({ path: pageData.path, views: 1 });
    }

    // Sort and keep top 10
    analytics.topPages.sort((a, b) => b.views - a.views);
    analytics.topPages = analytics.topPages.slice(0, 10);

    await writeDB(ANALYTICS_DB, analytics);
    return analytics;
}

async function trackEvent(eventData) {
    const analytics = await readDB(ANALYTICS_DB);
    
    const event = {
        id: analytics.events.length + 1,
        ...eventData,
        timestamp: new Date().toISOString()
    };

    analytics.events.push(event);
    
    // Keep only last 1000 events to prevent file bloat
    if (analytics.events.length > 1000) {
        analytics.events = analytics.events.slice(-1000);
    }

    await writeDB(ANALYTICS_DB, analytics);
    return event;
}

async function incrementUniqueVisitors() {
    const analytics = await readDB(ANALYTICS_DB);
    analytics.uniqueVisitors++;
    analytics.lastUpdated = new Date().toISOString();
    await writeDB(ANALYTICS_DB, analytics);
    return analytics;
}

// ========== SESSIONS CRUD ==========

async function createSession(sessionData) {
    const sessions = await readDB(SESSIONS_DB);
    
    const newSession = {
        id: sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1,
        ...sessionData,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };

    sessions.push(newSession);
    await writeDB(SESSIONS_DB, sessions);
    
    return newSession;
}

async function getActiveSessionCount() {
    const sessions = await readDB(SESSIONS_DB);
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    return sessions.filter(s => 
        new Date(s.lastActivity).getTime() > fiveMinutesAgo
    ).length;
}

async function updateSessionActivity(sessionId) {
    const sessions = await readDB(SESSIONS_DB);
    const index = sessions.findIndex(s => s.id === parseInt(sessionId));
    
    if (index >= 0) {
        sessions[index].lastActivity = new Date().toISOString();
        await writeDB(SESSIONS_DB, sessions);
        return sessions[index];
    }
    
    return null;
}

// ========== ERROR TRACKING ==========

async function logError(errorData) {
    const errors = await readDB(ERRORS_DB);
    
    const newError = {
        id: errors.length + 1,
        timestamp: new Date().toISOString(),
        message: errorData.message || 'Unknown error',
        stack: errorData.stack || null,
        type: errorData.type || 'UnknownError',
        url: errorData.url || null,
        userAgent: errorData.userAgent || null,
        context: errorData.context || {},
        resolved: false
    };

    errors.push(newError);
    
    // Keep only last 500 errors to prevent file bloat
    if (errors.length > 500) {
        errors.shift();
    }

    await writeDB(ERRORS_DB, errors);
    return newError;
}

async function getAllErrors(filters = {}) {
    const errors = await readDB(ERRORS_DB);
    let filtered = errors;

    if (filters.resolved !== undefined) {
        filtered = filtered.filter(e => e.resolved === filters.resolved);
    }
    if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function markErrorResolved(id) {
    const errors = await readDB(ERRORS_DB);
    const index = errors.findIndex(e => e.id === parseInt(id));
    
    if (index >= 0) {
        errors[index].resolved = true;
        errors[index].resolvedAt = new Date().toISOString();
        await writeDB(ERRORS_DB, errors);
        return errors[index];
    }
    
    return null;
}

// ========== DATABASE STATS ==========

async function getDatabaseStats() {
    const [contracts, reviews, analytics, sessions, errors] = await Promise.all([
        readDB(CONTRACTS_DB),
        readDB(REVIEWS_DB),
        readDB(ANALYTICS_DB),
        readDB(SESSIONS_DB),
        readDB(ERRORS_DB)
    ]);

    return {
        contracts: {
            total: contracts.length,
            active: contracts.filter(c => c.status === 'active').length,
            pending: contracts.filter(c => c.status === 'pending').length,
            completed: contracts.filter(c => c.status === 'completed').length
        },
        reviews: {
            total: reviews.length,
            approved: reviews.filter(r => r.approved).length,
            pending: reviews.filter(r => !r.approved).length,
            averageRating: reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
                : 0
        },
        analytics: {
            pageViews: analytics.pageViews,
            uniqueVisitors: analytics.uniqueVisitors,
            events: analytics.events.length,
            activeSessions: await getActiveSessionCount()
        },
        sessions: {
            total: sessions.length,
            active: await getActiveSessionCount()
        },
        errors: {
            total: errors.length,
            unresolved: errors.filter(e => !e.resolved).length,
            resolved: errors.filter(e => e.resolved).length,
            recent24h: errors.filter(e => {
                const errorTime = new Date(e.timestamp).getTime();
                const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                return errorTime > oneDayAgo;
            }).length
        }
    };
}

module.exports = {
    initDatabase,
    
    // Contracts
    getAllContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
    
    // Reviews
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    approveReview,
    
    // Analytics
    getAnalytics,
    trackPageView,
    trackEvent,
    incrementUniqueVisitors,
    
    // Sessions
    createSession,
    getActiveSessionCount,
    updateSessionActivity,
    
    // Error Tracking
    logError,
    getAllErrors,
    markErrorResolved,
    
    // Stats
    getDatabaseStats
};
