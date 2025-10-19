# BarodaTek — Champions Arena API

This repository contains the BarodaTek Champions Arena API and frontend static site.

Quick start (development):

```powershell
# install
npm install

# run the server (defaults to PORT=9000)
SET PORT=9000; SET ALLOW_LOCAL_AI_MOCK=true; node server.js

# run the Puppeteer diagnostic (optional)
npm run test:puppeteer
```

Useful scripts (from `package.json`):
- `npm start` — run production server
- `npm run dev` — run server in development
- `npm run lint` — lint checks (placeholder)
- `npm run test` — run unit tests

Diagnostics
- `tools/diagnose_game_buttons.js` — headless Puppeteer script that checks in-game controls and reports console errors.

If you push this repo to GitHub, enable Actions and Secrets if you want CI to run with real credentials.

---
Created automatically by the local workspace maintainer.
# 🦙 API Mock Contract MVP

A powerful and beginner-friendly API Mock Contract MVP built with Node.js, Express, and modern web technologies. Perfect for learning API development, frontend-backend integration, and Docker deployment!

## ✨ Latest Updates (v2.0)

### 🤖 Auto-Fix Error Handling System
Your server now includes **5 comprehensive auto-fix features** that handle production errors automatically:

| Error Type | Auto-Fix | Status |
|------------|----------|--------|
| 🔌 **EADDRINUSE** | Port Auto-Increment | ✅ Active |
| � **CORS_ERROR** | Enhanced Whitelist (Vercel/Railway) | ✅ Active |
| 🔍 **404_NOT_FOUND** | Smart Route Suggestions | ✅ Active |
| 🔌 **WEBSOCKET_DISCONNECT** | Exponential Backoff Reconnection | ✅ Active |
| 💾 **HIGH_MEMORY_USAGE** | Automatic Garbage Collection | ✅ Active |

**📖 Full Documentation**: See [ERROR-HANDLING.md](ERROR-HANDLING.md) for detailed information.

### 🎨 Minimalist Retro Design
- **Fonts**: Space Mono & IBM Plex Mono (monospace)
- **Colors**: Soft cyan, pink, yellow, green
- **Logo**: Emoji llama (🦙) - no external dependencies
- **Style**: Clean, transparent cards with subtle borders

## �🌟 Core Features

- **RESTful API** - Complete CRUD operations for contract management
- **Modern Web Interface** - Minimalist retro design with responsive UI
- **Interactive API Explorer** - Built-in testing interface with live examples
- **AI Monitor Dashboard** - Real-time error tracking and auto-fix status
- **Docker Support** - Easy deployment with Docker and Docker Compose
- **PowerShell Scripts** - Automated setup and management scripts
- **Real-time Statistics** - Contract analytics and metrics
- **Data Export/Import** - JSON export functionality for data portability
- **Sample Data Loading** - Pre-built sample contracts for testing
- **Postman Collection** - Ready-to-use API testing collection
- **WebSocket Manager** - Auto-reconnection with exponential backoff
- **Beginner Friendly** - Comprehensive documentation and examples
- **Production Ready** - Security best practices and auto-fix error handling

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Docker Desktop** (optional) - [Download here](https://www.docker.com/products/docker-desktop)

### Installation

1. **Clone or download this project**
2. **Open PowerShell as Administrator**
3. **Navigate to the project directory**
4. **Run the setup script:**
   ```powershell
   .\setup.ps1
   ```

### Running the Application

#### Option 1: Local Development
```powershell
.\start.ps1
```

#### Option 2: Docker (Recommended for Production)
```powershell
.\docker-run.ps1
```

#### Option 3: Docker Compose
```powershell
docker-compose up
```

### 🌐 Access the Application

#### 🚀 Live Production Deployment
**URL**: https://barodatek-79j1mznjj-jynee1baroda-6483s-projects.vercel.app

- **Web Interface**: https://barodatek-79j1mznjj-jynee1baroda-6483s-projects.vercel.app
- **AI Monitor Dashboard**: https://barodatek-79j1mznjj-jynee1baroda-6483s-projects.vercel.app/public/ai-monitor-dashboard.html
- **API Explorer**: https://barodatek-79j1mznjj-jynee1baroda-6483s-projects.vercel.app/public/api-explorer.html
- **API Health**: https://barodatek-79j1mznjj-jynee1baroda-6483s-projects.vercel.app/api/health

> ⚠️ **Note**: If visitors see "Access Required", you need to disable Deployment Protection in Vercel dashboard. See [IMGUR-FIXED-ACCESS-HOWTO.md](IMGUR-FIXED-ACCESS-HOWTO.md) for instructions.

#### 💻 Local Development
- **Web Interface**: http://localhost:8080
- **AI Monitor Dashboard**: http://localhost:8080/public/ai-monitor-dashboard.html
- **Interactive API Explorer**: http://localhost:8080/api-explorer.html
- **API Health Check**: http://localhost:8080/api/health
- **API Documentation**: http://localhost:8080/#api

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contracts` | Get all contracts |
| GET | `/api/contracts/:id` | Get contract by ID |
| POST | `/api/contracts` | Create new contract |
| PUT | `/api/contracts/:id` | Update contract |
| DELETE | `/api/contracts/:id` | Delete contract |
| GET | `/api/stats` | Get contract statistics |
| GET | `/api/health` | Health check |

## �️ Access Tools & Testing

### **Interactive API Explorer**
- Built-in web interface for testing all API endpoints
- Real-time response display with syntax highlighting
- Sample data loading and export functionality
- Access at: http://localhost:8080/api-explorer.html

### **Postman Collection**
- Import `postman-collection.json` into Postman
- Pre-configured requests with test scripts
- Automated testing and validation
- Environment variables for easy setup

### **Data Management**
- **Export Data**: Download all contracts as JSON
- **Sample Data**: Load pre-built test contracts
- **Real-time Stats**: Live contract analytics
- **Interactive Forms**: User-friendly contract creation

### **Developer Tools**
- PowerShell automation scripts
- Docker deployment options
- Health check endpoints
- Comprehensive error handling

## �📊 Example API Usage

### Get All Contracts
```bash
curl http://localhost:8080/api/contracts
```

### Create New Contract
```bash
curl -X POST http://localhost:8080/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Development Contract",
    "client": "Tech Company",
    "provider": "Dev Studio",
    "amount": 75000,
    "description": "Custom web application development"
  }'
```

### Get Statistics
```bash
curl http://localhost:8080/api/stats
```

## 🛠️ Development Commands

| Script | Description |
|--------|-------------|
| `.\setup.ps1` | Initial setup and dependency installation |
| `.\start.ps1` | Start development server |
| `.\build.ps1` | Prepare for production |
| `.\docker-run.ps1` | Build and run with Docker |
| `.\test.ps1` | Test API endpoints |

## 🐳 Docker Commands

```powershell
# Build image
docker build -t api-mock-contract .

# Run container
docker run -p 3000:3000 api-mock-contract

# Using Docker Compose
docker-compose up -d
docker-compose down
```

## 📁 Project Structure

```
api-mock-contract-mvp/
├── public/                 # Web interface files
│   ├── index.html         # Main webpage
│   └── app.js            # Frontend JavaScript
├── .github/              # GitHub configuration
│   └── copilot-instructions.md
├── server.js             # Express server
├── package.json          # Node.js dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── setup.ps1           # Setup script
├── start.ps1           # Start script
├── build.ps1           # Build script
├── docker-run.ps1      # Docker run script
├── test.ps1            # Test script
└── README.md           # This file
```

## 🎯 Learning Objectives

This project helps you learn:

- **API Development** - RESTful API design and implementation
- **Frontend-Backend Integration** - How web interfaces communicate with APIs
- **Docker Deployment** - Containerization and deployment strategies
- **JavaScript/Node.js** - Modern JavaScript development
- **Web Development** - HTML, CSS, and responsive design
- **DevOps Basics** - Automation scripts and deployment pipelines

## 🔧 Customization

### Adding New Endpoints
1. Add new route in `server.js`
2. Implement the endpoint logic
3. Update the frontend in `public/app.js`
4. Test with `.\test.ps1`

### Styling Changes
1. Modify CSS in `public/index.html`
2. Update Bootstrap classes as needed
3. Add custom JavaScript in `public/app.js`

### Database Integration
Replace the in-memory `contracts` array with:
- MongoDB
- PostgreSQL
- SQLite
- Any database of your choice

## 🚀 Deployment Options

### Local Development
- Run with `.\start.ps1`
- Access at http://localhost:8080

### Docker Desktop
- Run with `.\docker-run.ps1`
- Automatically builds and starts container

### Cloud Deployment
- Push to GitHub
- Deploy to Heroku, Vercel, or AWS
- Use the Dockerfile for containerized deployment

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📚 Resources for Learning

- **Node.js Documentation**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **Docker Tutorial**: https://docs.docker.com/get-started/
- **API Design Best Practices**: https://restfulapi.net/
- **Bootstrap Documentation**: https://getbootstrap.com/docs/

## 🏆 Next Steps

After mastering this MVP, consider:

1. **Add Authentication** - JWT tokens, user login
2. **Database Integration** - Persistent data storage
3. **Testing Suite** - Unit and integration tests
4. **CI/CD Pipeline** - Automated deployment
5. **Advanced Features** - File uploads, email notifications
6. **Microservices** - Split into multiple services

## ❤️ Support

If this project helped you learn something new, please:
- ⭐ Star the repository
- 🐛 Report issues
- 💡 Suggest improvements
- 📢 Share with others

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! 🚀**

*Built with ❤️ for the coding community*
