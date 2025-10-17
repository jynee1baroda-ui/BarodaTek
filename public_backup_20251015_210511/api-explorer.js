// API Explorer JavaScript - Interactive API Testing Tool

// Dynamic API configuration
const API_CONFIG = {
    baseURL: window.location.origin,
    apiPath: '/api'
};
const API_BASE_URL = `${API_CONFIG.baseURL}${API_CONFIG.apiPath}`;

// Utility function to show notifications
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Format JSON response for display
function formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
}

// Show loading state
function showLoading(endpointId, button) {
    const spinner = button.querySelector('.loading-spinner');
    const icon = button.querySelector('i:not(.loading-spinner i)');
    
    if (spinner) spinner.style.display = 'inline-block';
    if (icon) icon.style.display = 'none';
    button.disabled = true;
}

// Hide loading state
function hideLoading(endpointId, button) {
    const spinner = button.querySelector('.loading-spinner');
    const icon = button.querySelector('i:not(.loading-spinner i)');
    
    if (spinner) spinner.style.display = 'none';
    if (icon) icon.style.display = 'inline';
    button.disabled = false;
}

// Test a simple endpoint
async function testEndpoint(endpoint, method) {
    const button = window._currentEvent ? window._currentEvent.target.closest('button') : null;
    const responseElement = document.getElementById(`${endpoint}-response`);
    
    if (button) showLoading(endpoint, button);
    responseElement.innerHTML = '<div class="text-info">Making request...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Format response with status
        const formattedResponse = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        responseElement.innerHTML = `<pre>${formatJSON(formattedResponse)}</pre>`;
        
        if (response.ok) {
            showNotification(`${method} /${endpoint} - Success!`, 'success');
        } else {
            showNotification(`${method} /${endpoint} - Error: ${response.status}`, 'warning');
        }
        
    } catch (error) {
        responseElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
        showNotification(`Network error: ${error.message}`, 'danger');
    } finally {
        hideLoading(endpoint, button);
    }
}

// Test endpoint with ID parameter
async function testEndpointWithId(endpoint, method) {
    const button = event.target;
    const id = document.getElementById('contract-id').value;
    const responseElement = document.getElementById(`${endpoint}-id-response`);
    
    if (!id) {
        showNotification('Please enter a contract ID', 'warning');
        return;
    }
    
    showLoading(`${endpoint}-id`, button);
    responseElement.innerHTML = '<div class="text-info">Making request...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const formattedResponse = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        responseElement.innerHTML = `<pre>${formatJSON(formattedResponse)}</pre>`;
        
        if (response.ok) {
            showNotification(`${method} /${endpoint}/${id} - Success!`, 'success');
        } else {
            showNotification(`${method} /${endpoint}/${id} - Error: ${response.status}`, 'warning');
        }
        
    } catch (error) {
        responseElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
        showNotification(`Network error: ${error.message}`, 'danger');
    } finally {
        hideLoading(`${endpoint}-id`, button);
    }
}

// Test create contract endpoint
async function testCreateContract() {
    const button = event.target;
    const bodyText = document.getElementById('create-contract-body').value;
    const responseElement = document.getElementById('create-contract-response');
    
    showLoading('create-contract', button);
    responseElement.innerHTML = '<div class="text-info">Making request...</div>';
    
    try {
        const requestBody = JSON.parse(bodyText);
        
        const response = await fetch(`${API_BASE_URL}/contracts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        const formattedResponse = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        responseElement.innerHTML = `<pre>${formatJSON(formattedResponse)}</pre>`;
        
        if (response.ok) {
            showNotification('Contract created successfully!', 'success');
        } else {
            showNotification(`Error creating contract: ${response.status}`, 'danger');
        }
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            responseElement.innerHTML = `<div class="text-danger">Invalid JSON: ${error.message}</div>`;
            showNotification('Invalid JSON in request body', 'danger');
        } else {
            responseElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
            showNotification(`Network error: ${error.message}`, 'danger');
        }
    } finally {
        hideLoading('create-contract', button);
    }
}

// Test delete contract endpoint
async function testDeleteContract() {
    const button = event.target;
    const id = document.getElementById('delete-contract-id').value;
    const responseElement = document.getElementById('delete-contract-response');
    
    if (!id) {
        showNotification('Please enter a contract ID', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete contract ${id}?`)) {
        return;
    }
    
    showLoading('delete-contract', button);
    responseElement.innerHTML = '<div class="text-info">Making request...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        const formattedResponse = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
        
        responseElement.innerHTML = `<pre>${formatJSON(formattedResponse)}</pre>`;
        
        if (response.ok) {
            showNotification(`Contract ${id} deleted successfully!`, 'success');
        } else {
            showNotification(`Error deleting contract: ${response.status}`, 'danger');
        }
        
    } catch (error) {
        responseElement.innerHTML = `<div class="text-danger">Error: ${error.message}</div>`;
        showNotification(`Network error: ${error.message}`, 'danger');
    } finally {
        hideLoading('delete-contract', button);
    }
}

// Sample data templates
const sampleDataTemplates = {
    'web-dev': {
        title: "Web Development Contract",
        client: "TechStart Inc",
        provider: "DevStudio",
        amount: 75000,
        description: "Full-stack web application development",
        expiryDate: "2025-12-31"
    },
    'consulting': {
        title: "IT Consulting Agreement",
        client: "Enterprise Corp",
        provider: "Tech Consultants LLC",
        amount: 120000,
        description: "Digital transformation consulting services",
        expiryDate: "2025-06-30"
    },
    'maintenance': {
        title: "Software Maintenance Contract",
        client: "Global Solutions",
        provider: "Support Team Inc",
        amount: 36000,
        description: "Annual software maintenance and support",
        expiryDate: "2025-12-31"
    }
};

// Use sample data
function useSampleData(template) {
    const sampleData = sampleDataTemplates[template] || sampleDataTemplates['web-dev'];
    document.getElementById('create-contract-body').value = formatJSON(sampleData);
    showNotification('Sample data loaded!', 'info');
}

// Load multiple sample contracts
async function loadSampleData() {
    const samples = Object.values(sampleDataTemplates);
    let successCount = 0;
    
    for (const sample of samples) {
        try {
            const response = await fetch(`${API_BASE_URL}/contracts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sample)
            });
            
            if (response.ok) {
                successCount++;
            }
        } catch (error) {
            console.error('Error loading sample:', error);
        }
    }
    
    showNotification(`Loaded ${successCount} sample contracts!`, 'success');
}

// Test all endpoints sequentially
async function testAllEndpoints() {
    showNotification('Testing all endpoints...', 'info');
    
    const tests = [
        { endpoint: 'health', method: 'GET' },
        { endpoint: 'contracts', method: 'GET' },
        { endpoint: 'stats', method: 'GET' }
    ];
    
    for (const test of tests) {
        try {
            const response = await fetch(`${API_BASE_URL}/${test.endpoint}`, {
                method: test.method
            });
            
            if (response.ok) {
                console.log(`✅ ${test.method} /${test.endpoint} - OK`);
            } else {
                console.log(`❌ ${test.method} /${test.endpoint} - Error: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.method} /${test.endpoint} - Network Error`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    showNotification('All endpoints tested! Check console for details.', 'success');
}

// Clear all data (not implemented in backend, just a demo)
function clearAllData() {
    if (confirm('This would clear all contracts. Feature not implemented for safety.')) {
        showNotification('Clear data feature not implemented for safety', 'warning');
    }
}

// Export data functionality
async function exportData() {
    try {
        const response = await fetch(`${API_BASE_URL}/contracts`);
        const data = await response.json();
        
        if (data.success) {
            const exportData = {
                exportDate: new Date().toISOString(),
                totalContracts: data.count,
                contracts: data.data
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contracts-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            showNotification('Data exported successfully!', 'success');
        }
    } catch (error) {
        showNotification('Error exporting data', 'danger');
    }
}

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    const text = `# Get all contracts
curl ${API_CONFIG.baseURL}/api/contracts

# Create new contract
curl -X POST ${API_CONFIG.baseURL}/api/contracts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Test","client":"Client","provider":"Provider","amount":5000}'`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('cURL examples copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'danger');
    });
}

// Initialize the API Explorer
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 API Explorer loaded successfully!');
    
    // Test initial connection
    fetch(`${API_BASE_URL}/health`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Connected to API successfully!', 'success');
            }
        })
        .catch(() => {
            showNotification('Cannot connect to API. Make sure the server is running.', 'warning');
        });
    
    // CSP-safe delegated event handling for all interactive buttons
    document.addEventListener('click', function(e) {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        
        e.preventDefault();
        const action = actionEl.getAttribute('data-action');
        const arg = actionEl.getAttribute('data-arg');
        const endpoint = actionEl.getAttribute('data-endpoint');
        const method = actionEl.getAttribute('data-method');
        
        // Store event for functions that need it
        window._currentEvent = e;
        
        switch(action) {
            case 'testEndpoint':
                if (endpoint && method) {
                    testEndpoint(endpoint, method);
                }
                break;
            case 'testEndpointWithId':
                if (endpoint && method) {
                    testEndpointWithId(endpoint, method);
                }
                break;
            case 'testCreateContract':
                testCreateContract();
                break;
            case 'testDeleteContract':
                testDeleteContract();
                break;
            case 'useSampleData':
                useSampleData(arg);
                break;
            case 'copyToClipboard':
                copyToClipboard(arg);
                break;
            case 'loadSampleData':
                loadSampleData();
                break;
            case 'testAllEndpoints':
                testAllEndpoints();
                break;
            case 'clearAllData':
                clearAllData();
                break;
            case 'exportData':
                exportData();
                break;
            default:
                console.warn('Unknown action:', action);
        }
        
        // Clean up
        delete window._currentEvent;
    });
    
    console.log(`
    🎯 API Explorer Features:
    ✅ Interactive endpoint testing
    ✅ Real-time response display
    ✅ Sample data loading
    ✅ Export functionality
    ✅ cURL examples
    ✅ CSP-compliant event handling
    
    Happy testing! 🧪
    `);
});