import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ArenaCoding() {
  const [activeTab, setActiveTab] = useState('api');

  const tools = {
    api: [
      {
        method: 'GET',
        endpoint: '/api/users',
        description: 'Retrieve all users',
        response: '200 OK',
      },
      {
        method: 'POST',
        endpoint: '/api/users',
        description: 'Create new user',
        response: '201 Created',
      },
      {
        method: 'PUT',
        endpoint: '/api/users/:id',
        description: 'Update user by ID',
        response: '200 OK',
      },
      {
        method: 'DELETE',
        endpoint: '/api/users/:id',
        description: 'Delete user by ID',
        response: '204 No Content',
      },
    ],
    utilities: [
      {
        name: 'JSON Formatter',
        icon: '📋',
        description: 'Format and validate JSON data with syntax highlighting',
      },
      {
        name: 'Base64 Encoder',
        icon: '🔐',
        description: 'Encode and decode Base64 strings',
      },
      {
        name: 'JWT Decoder',
        icon: '🔑',
        description: 'Decode and inspect JWT tokens',
      },
      {
        name: 'Color Picker',
        icon: '🎨',
        description: 'Generate color palettes and convert formats',
      },
    ],
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-500',
      POST: 'text-blue-500',
      PUT: 'text-yellow-500',
      DELETE: 'text-red-500',
    };
    return colors[method] || 'text-arena-gray';
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6">
            DEVELOPER <span className="glow-text-red">ARSENAL</span>
          </h1>
          <p className="text-xl text-arena-gray max-w-3xl mx-auto">
            Professional API endpoints and web tools built for speed, reliability, and developer happiness.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-arena-dark-gray rounded-lg p-1 border-2 border-arena-mid-gray">
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'api'
                  ? 'bg-arena-red text-white'
                  : 'text-arena-gray hover:text-white'
              }`}
            >
              API ENDPOINTS
            </button>
            <button
              onClick={() => setActiveTab('utilities')}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'utilities'
                  ? 'bg-arena-red text-white'
                  : 'text-arena-gray hover:text-white'
              }`}
            >
              WEB UTILITIES
            </button>
          </div>
        </div>

        {/* API Endpoints Tab */}
        {activeTab === 'api' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {tools.api.map((endpoint, index) => (
              <div key={index} className="arena-card group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-mono font-bold ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-arena-gray font-mono">{endpoint.endpoint}</code>
                    </div>
                    <p className="text-arena-gray text-sm">{endpoint.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-green-500 font-mono">{endpoint.response}</span>
                    <button className="btn-arena-secondary text-sm">
                      TRY IT
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Code Example */}
            <div className="arena-card mt-8">
              <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                <span>💻</span>
                <span>Example Request</span>
              </h3>
              <pre className="bg-arena-black p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code className="text-green-400">
{`fetch('https://barodatek.com/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));`}
                </code>
              </pre>
            </div>
          </motion.div>
        )}

        {/* Web Utilities Tab */}
        {activeTab === 'utilities' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {tools.utilities.map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="arena-card group cursor-pointer text-center"
              >
                <div className="text-5xl mb-4">{tool.icon}</div>
                <h3 className="text-xl font-heading font-bold mb-3 group-hover:text-arena-red transition-colors">
                  {tool.name}
                </h3>
                <p className="text-arena-gray text-sm mb-4">{tool.description}</p>
                <button className="btn-arena-primary text-sm w-full">
                  OPEN TOOL
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Documentation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center arena-card p-8"
        >
          <h3 className="text-2xl font-heading font-bold mb-4">
            Need <span className="glow-text-red">Documentation</span>?
          </h3>
          <p className="text-arena-gray mb-6">
            Complete API reference, code examples, and integration guides available.
          </p>
          <button className="btn-arena-primary">
            VIEW FULL DOCS
          </button>
        </motion.div>
      </div>
    </div>
  );
}
