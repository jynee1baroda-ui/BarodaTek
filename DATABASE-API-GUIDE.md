# 🎯 Real Database API Documentation

## ✅ **All Data Now Persists Between Deployments!**

Your BarodaTek API now uses **real JSON-based database storage** with full CRUD operations and data persistence.

---

## 📋 **1. CONTRACTS API** (`/api/contracts`)

### **GET** `/api/contracts` - Get all contracts
**Query Parameters:**
- `status` - Filter by status (active, pending, completed)
- `client` - Search by client name

**Example:**
```bash
GET /api/contracts?status=active
GET /api/contracts?client=Acme
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "API Development Contract",
      "version": "1.0.0",
      "description": "Full-stack API development",
      "client": "Acme Corp",
      "value": 50000,
      "status": "active",
      "createdAt": "2025-10-14T10:00:00.000Z",
      "updatedAt": "2025-10-14T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### **GET** `/api/contracts/:id` - Get single contract

**Example:**
```bash
GET /api/contracts/1
```

---

### **POST** `/api/contracts` - Create new contract

**Required Fields:**
- `name` - Contract name
- `version` - Version number
- `description` - Description

**Optional Fields:**
- `client` - Client name
- `value` - Contract value
- `endpoints` - Number of endpoints
- `status` - Status (default: "pending")

**Example:**
```bash
POST /api/contracts
Content-Type: application/json

{
  "name": "Payment Gateway Integration",
  "version": "1.0.0",
  "description": "Stripe payment gateway integration",
  "client": "TechCorp",
  "value": 75000,
  "status": "pending"
}
```

---

### **PUT** `/api/contracts/:id` - Update contract

**Example:**
```bash
PUT /api/contracts/1
Content-Type: application/json

{
  "status": "completed",
  "value": 80000
}
```

---

### **DELETE** `/api/contracts/:id` - Delete contract

**Example:**
```bash
DELETE /api/contracts/1
```

---

## ⭐ **2. REVIEWS API** (`/api/reviews`)

### **GET** `/api/reviews` - Get all reviews

**Query Parameters:**
- `approved=true` - Only approved reviews
- `approved=false` - Only pending reviews
- `rating=4` - Minimum rating

**Example:**
```bash
GET /api/reviews?approved=true
GET /api/reviews?rating=4
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "rating": 5,
      "comment": "Excellent service!",
      "service": "API Development",
      "approved": true,
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### **POST** `/api/reviews` - Submit new review

**Required Fields:**
- `name` - Reviewer name
- `rating` - Rating (1-5)
- `comment` - Review text

**Optional Fields:**
- `email` - Email address
- `service` - Service reviewed

**Example:**
```bash
POST /api/reviews
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "rating": 5,
  "comment": "Amazing API platform! Very easy to use.",
  "service": "API Playground"
}
```

**Note:** New reviews are automatically set to `approved: false` and need manual approval.

---

### **PUT** `/api/reviews/:id/approve` - Approve review (Admin)

**Example:**
```bash
PUT /api/reviews/1/approve
```

---

### **DELETE** `/api/reviews/:id` - Delete review

**Example:**
```bash
DELETE /api/reviews/1
```

---

## 📊 **3. ANALYTICS API** (`/api/analytics`)

### **GET** `/api/analytics` - Get analytics data

**Response:**
```json
{
  "success": true,
  "data": {
    "pageViews": 1523,
    "uniqueVisitors": 342,
    "activeSessions": 8,
    "totalEvents": 4567,
    "topPages": [
      { "path": "/", "views": 500 },
      { "path": "/api-playground.html", "views": 250 }
    ],
    "lastUpdated": "2025-10-14T10:30:00.000Z",
    "uptime": 3600
  }
}
```

---

### **POST** `/api/analytics/event` - Track custom event

**Example:**
```bash
POST /api/analytics/event
Content-Type: application/json

{
  "type": "button_click",
  "action": "download",
  "label": "Documentation",
  "value": 1
}
```

---

## 📈 **4. REAL-TIME STATS API** (`/api/stats`)

### **GET** `/api/stats` - Get real-time statistics

**Response:**
```json
{
  "success": true,
  "totalViews": 1523,
  "viewsToday": 1523,
  "apiRequests": 4567,
  "activeVisitors": 8,
  "uptime": 3600,
  "database": {
    "contracts": {
      "total": 15,
      "active": 8,
      "pending": 3,
      "completed": 4
    },
    "reviews": {
      "total": 24,
      "approved": 20,
      "pending": 4,
      "averageRating": "4.7"
    },
    "analytics": {
      "pageViews": 1523,
      "uniqueVisitors": 342,
      "events": 4567,
      "activeSessions": 8
    }
  }
}
```

---

### **POST** `/api/stats/pageview` - Track page view

**Example:**
```bash
POST /api/stats/pageview
Content-Type: application/json

{
  "page": "/api-playground.html",
  "sessionId": "abc123",
  "timestamp": "2025-10-14T10:30:00.000Z"
}
```

---

## 🏥 **5. HEALTH CHECK API** (`/api/health`)

### **GET** `/api/health` - Get system health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "2.0.0",
  "platform": "BarodaTek.com",
  "database": {
    "contracts": { "total": 15, "active": 8 },
    "reviews": { "total": 24, "approved": 20 },
    "analytics": { "pageViews": 1523, "uniqueVisitors": 342 }
  }
}
```

---

## 🔥 **Key Features**

✅ **Real Data Persistence** - All data saved to JSON files  
✅ **Full CRUD Operations** - Create, Read, Update, Delete  
✅ **Automatic Timestamps** - createdAt & updatedAt tracking  
✅ **Filtering & Searching** - Query parameters for all GET endpoints  
✅ **Review Moderation** - Approval system for user reviews  
✅ **Real-time Analytics** - Track page views, events, sessions  
✅ **Database Stats** - Complete overview of all data  
✅ **Error Handling** - Comprehensive error messages  
✅ **California Legal Compliant** - No piracy, official links only  

---

## 📁 **Data Storage Location**

All data is stored in the `/data` directory:

```
/data
  ├── contracts.json      (All contracts)
  ├── reviews.json        (All reviews)
  ├── analytics.json      (Analytics data)
  ├── users.json          (User data)
  └── sessions.json       (Active sessions)
```

---

## 🚀 **Testing the API**

### Using the API Playground:
1. Go to: https://barodatek-jll6ms4ef-jynee1baroda-6483s-projects.vercel.app/api-playground.html
2. Select endpoint from dropdown
3. Add request body (for POST/PUT)
4. Click "Send Request"

### Using cURL:
```bash
# Create a contract
curl -X POST https://your-site.vercel.app/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New API Contract",
    "version": "1.0.0",
    "description": "Test contract",
    "client": "Test Client",
    "value": 10000
  }'

# Get all contracts
curl https://your-site.vercel.app/api/contracts

# Submit a review
curl -X POST https://your-site.vercel.app/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "rating": 5,
    "comment": "Great API!",
    "service": "Testing"
  }'

# Get analytics
curl https://your-site.vercel.app/api/analytics

# Check health
curl https://your-site.vercel.app/api/health
```

---

## 🎨 **Vercel Error Codes Page**

**NEW!** User-friendly error documentation:
📄 **URL:** `/error-codes.html`

Features:
- ✅ **White text on colored backgrounds** - Perfect contrast
- ✅ **Black text on white cards** - Easy to read
- ✅ **Search functionality** - Find errors quickly
- ✅ **Category filters** - Application, Platform, Function, DNS
- ✅ **Color-coded badges** - HTTP status codes
- ✅ **Solution tips** - Fix errors fast
- ✅ **Mobile responsive** - Works on all devices

---

## 💡 **What Changed?**

### Before:
- ❌ Mock data (resets on restart)
- ❌ In-memory storage
- ❌ No persistence

### After:
- ✅ Real database (JSON files)
- ✅ Full CRUD operations
- ✅ Data persists between deployments
- ✅ Review moderation system
- ✅ Real-time analytics tracking
- ✅ Session management
- ✅ Database statistics

---

## 🎉 **Ready to Use!**

Your API is now **production-ready** with:
- Real data persistence
- Full CRUD endpoints
- Analytics tracking
- Review system
- Error handling
- Health monitoring

**Live Production URL:**
🌐 https://barodatek-jll6ms4ef-jynee1baroda-6483s-projects.vercel.app

**Test it now with the API Playground!**
