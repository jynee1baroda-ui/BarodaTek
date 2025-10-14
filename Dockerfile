# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { host: 'localhost', port: 3000, path: '/api/health', timeout: 2000 }; \
  const request = http.request(options, (res) => { \
    console.log('Health check passed'); \
    process.exit(0); \
  }); \
  request.on('error', () => { \
    console.log('Health check failed'); \
    process.exit(1); \
  }); \
  request.end();"

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]