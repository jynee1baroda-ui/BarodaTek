// Arena Analytics & Status API Endpoints
// Add these to your Express server (server.js or similar)

import express from 'express';
const router = express.Router();

// In-memory session tracking (use Redis in production)
const sessions = new Map();
let pageViews = 0;
let apiRequestsPerMin = 0;
let lastMinuteReset = Date.now();

// Middleware to track sessions
function trackSession(req, res, next) {
  const sessionId = req.headers['x-session-id'] || req.ip;
  sessions.set(sessionId, Date.now());
  
  // Clean up expired sessions (>30 min)
  const thirtyMinAgo = Date.now() - (30 * 60 * 1000);
  for (const [id, timestamp] of sessions.entries()) {
    if (timestamp < thirtyMinAgo) {
      sessions.delete(id);
    }
  }
  
  next();
}

// Track API requests per minute
function trackApiRequest() {
  const now = Date.now();
  if (now - lastMinuteReset > 60000) {
    apiRequestsPerMin = 0;
    lastMinuteReset = now;
  }
  apiRequestsPerMin++;
}

// GET /api/arena-stats - Real-time analytics
router.get('/arena-stats', trackSession, (req, res) => {
  trackApiRequest();
  pageViews++;
  
  const stats = {
    activeUsers: sessions.size,
    pageViews: pageViews,
    apiRequests: apiRequestsPerMin,
    uptime: 99.9, // Calculate from server start time
    status: 'operational'
  };
  
  res.json(stats);
});

// GET /api/status - System status check
router.get('/status', (req, res) => {
  // Check if system is operational, patching, or offline
  // In production, check database, services, etc.
  const status = {
    status: 'operational', // or 'patching' or 'offline'
    timestamp: new Date().toISOString()
  };
  
  res.json(status);
});

// GET /api/patch - Patch/maintenance info
router.get('/patch', (req, res) => {
  // Return null if no active patch, otherwise return patch details
  const patch = null; // or { version: '2.0.0', description: 'Performance upgrades', eta: '15 minutes' }
  
  if (patch) {
    res.json(patch);
  } else {
    res.status(404).json({ error: 'No active maintenance' });
  }
});

export default router;

// In your main server file (server.js), add:
// import arenaRoutes from './api/arena-routes.js';
// app.use('/api', arenaRoutes);
