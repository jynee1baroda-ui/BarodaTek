# 🔧 BarodaTek Troubleshooting Guide

## 🚨 Issue: "localhost refused to connect" (ERR_CONNECTION_REFUSED)

### ✅ ROOT CAUSE IDENTIFIED:
**The Node.js server is not running!**

### 🔴 SOLUTION:

1. **Open PowerShell** in the project directory:
   ```powershell
   cd c:\NewpROJEKTAI
   ```

2. **Start the server**:
   ```powershell
   node server.js
   ```

3. **You should see this output**:
   ```
   🚀 BarodaTek.com API Mock Contract MVP Server Started!
   📡 Server running on port 8080
   🌐 Local Development: http://localhost:8080
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:8080
   ```

---

## 🐛 Issue: Buttons Not Working / Functions Not Found

### ✅ ROOT CAUSE:
**Browser cache is serving old JavaScript files!**

### 🔴 SOLUTIONS (Try in order):

#### Method 1: Hard Reload (FASTEST) ⚡
- **Windows**: Press `Ctrl + Shift + R`
- **Mac**: Press `Cmd + Shift + R`

#### Method 2: Clear Cache 🧹
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Press `F5` to refresh

#### Method 3: Incognito/Private Mode 🕵️
- **Chrome**: `Ctrl + Shift + N`
- **Firefox**: `Ctrl + Shift + P`
- **Edge**: `Ctrl + Shift + N`

#### Method 4: Try Different Browser 🌐
- If using Chrome, try Edge or Firefox
- This confirms if it's a cache issue

---

## 📋 Complete Diagnostic Checklist

### 1. Server Status ✅
- [ ] Server is running (`node server.js`)
- [ ] No error messages in PowerShell
- [ ] Can access http://localhost:8080

### 2. Browser Check ✅
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] No console errors (Press F12 → Console tab)
- [ ] JavaScript files loading (Network tab shows app.js)

### 3. File Integrity ✅
- [ ] `server.js` exists in root directory
- [ ] `public/app.js` exists and is not empty
- [ ] `public/index.html` exists
- [ ] `node_modules` folder exists

### 4. Function Tests ✅
Open browser console (F12) and run:
```javascript
// Test if functions are loaded
console.log('loadContracts:', typeof window.loadContracts);
console.log('startGame:', typeof window.startGame);
console.log('handleCommand:', typeof window.handleCommand);
```

All should show: `function` ✅

---

## 🔍 Quick Diagnostic Tests

### Test 1: Check Server
```powershell
# In PowerShell
Test-Path server.js
# Should return: True

node --version
# Should return: v24.10.0 (or similar)
```

### Test 2: Check Port
```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080
# If empty, port is free. If shows results, server is running.
```

### Test 3: Check Files
```powershell
# List public files
Get-ChildItem public\*.html | Select-Object Name
# Should show: index.html, api-explorer.html, etc.
```

### Test 4: Syntax Check
```powershell
# Check server.js for errors
node -c server.js
# Should return nothing (no errors)

# Check app.js for errors
node -c public\app.js
# Should return nothing (no errors)
```

---

## 🎯 Common Issues & Solutions

### Issue: "Function not defined"
**Cause**: Browser using cached old version of app.js  
**Fix**: Hard reload with `Ctrl + Shift + R`

### Issue: "404 Not Found"
**Cause**: Server not running or wrong URL  
**Fix**: Start server with `node server.js`, use http://localhost:8080

### Issue: "Can't read property of undefined"
**Cause**: JavaScript error in code  
**Fix**: Check browser console (F12) for error details

### Issue: "Access denied" or "CORS error"
**Cause**: Server security settings  
**Fix**: Server has CORS enabled, should work. Try different browser.

### Issue: Buttons do nothing when clicked
**Cause**: 
1. Functions not loaded (cache issue)
2. onclick handlers not attached
3. JavaScript errors blocking execution

**Fix**:
1. Clear cache (Ctrl + Shift + R)
2. Check console for errors (F12)
3. Run diagnostic: http://localhost:8080/diagnostic.html

---

## 🚀 Recommended Workflow

### Starting Development:
```powershell
# 1. Navigate to project
cd c:\NewpROJEKTAI

# 2. Start server
node server.js

# 3. Open browser to:
http://localhost:8080

# 4. Clear cache on first load
Ctrl + Shift + R
```

### Making Changes:
```powershell
# 1. Edit files in VS Code

# 2. Save changes (Ctrl + S)

# 3. Hard reload browser (Ctrl + Shift + R)

# 4. Test functionality
```

### Shutting Down:
```powershell
# In PowerShell where server is running:
Ctrl + C

# Confirm shutdown message appears
```

---

## 🔬 Advanced Diagnostics

### Check All Functions Exist:
```javascript
// Run in browser console (F12)
const requiredFunctions = [
    'loadContracts', 'showCreateForm', 'testAPI', 'loadSampleContracts',
    'downloadCompleteProject', 'downloadPostmanCollection', 'generateOpenAPISpec',
    'downloadCurlExamples', 'exportAllData', 'downloadTemplate', 'showCustomizer',
    'generateBoilerplate', 'copyCode', 'createContract', 'quickAPITest',
    'generateCustomCode', 'generateCode', 'copyGeneratedCode', 'downloadGeneratedCode',
    'startGame', 'handleCommand', 'setCommand'
];

requiredFunctions.forEach(fn => {
    const exists = typeof window[fn] === 'function';
    console.log(`${exists ? '✅' : '❌'} ${fn}`);
});
```

### Check app.js Version:
```javascript
// Run in browser console
const appScript = document.querySelector('script[src*="app.js"]');
console.log('app.js URL:', appScript.src);
console.log('Has version param:', appScript.src.includes('?v='));
```

Expected: `app.js?v=2024-10-14-real`

### Check API Connection:
```javascript
// Run in browser console
fetch('/api/health')
    .then(r => r.json())
    .then(d => console.log('✅ API working:', d))
    .catch(e => console.error('❌ API error:', e));
```

Expected result: `{status: "healthy", ...}`

---

## 📞 Still Having Issues?

### Comprehensive Diagnostic Page:
Visit: **http://localhost:8080/diagnostic.html**

This page will automatically test:
- Server connection
- JavaScript file loading
- Function availability
- Browser cache status
- API endpoints
- Console errors
- Network status

### Manual Console Inspection:
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Look for error messages (red text)
4. Go to **Network** tab
5. Refresh page (F5)
6. Check if `app.js` loads successfully
7. Check if response is 200 OK

### Check Server Logs:
Look at the PowerShell window where server is running:
- Should show request logs when you access pages
- Any errors will appear here
- 404 errors mean file not found
- 500 errors mean server error

---

## ✅ Verification Tests

### After Fixing, Verify:

1. **Server Running**:
   ```
   Visit: http://localhost:8080
   Should show: BarodaTek homepage
   ```

2. **Functions Working**:
   ```
   Click: "Load Contracts" button
   Should show: Contract list or "No contracts" message
   ```

3. **Downloads Working**:
   ```
   Click: "Download Complete Project Package"
   Should download: barodatek-complete-package.zip
   ```

4. **Games Working**:
   ```
   Click: "Play Interactive Demo"
   Should start: Number guessing game
   ```

5. **API Testing**:
   ```
   Visit: http://localhost:8080/api-explorer.html
   Click: "GET /api/health"
   Should show: {"status": "healthy"}
   ```

---

## 📊 Status Indicators

### ✅ Everything Working:
- Server shows startup message
- Homepage loads with no console errors
- All buttons respond when clicked
- Downloads create real files
- Games are interactive
- API Explorer works

### ⚠️ Partial Issues:
- Server running but some functions don't work → **Cache issue**
- Some buttons work, others don't → **Check specific function in console**
- Downloads open but empty → **JSZip library issue**

### ❌ Complete Failure:
- Can't connect to localhost → **Server not running**
- Page loads but nothing works → **JavaScript not loading**
- Errors in console → **Code syntax error**

---

## 🛠️ Emergency Reset

If nothing works, try complete reset:

```powershell
# 1. Stop any running server
# Press Ctrl+C in PowerShell

# 2. Clear all caches
# In browser: Ctrl + Shift + Delete → Clear all

# 3. Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install

# 4. Restart server
node server.js

# 5. Open in Incognito mode
# Chrome: Ctrl + Shift + N
# Visit: http://localhost:8080
```

---

## 📝 Code Validation

### Check for syntax errors:

```powershell
# Validate all JavaScript files
node -c server.js
node -c public\app.js
node -c public\barodatek-analytics.js

# If any show errors, those need to be fixed
```

### Check HTML structure:

```powershell
# Look for mismatched tags
Select-String -Path public\index.html -Pattern "<script|</script>"

# Should have matching open and close tags
```

---

## 🎓 Understanding the System

### How It Works:
1. **server.js** runs Node.js Express server on port 8080
2. **public/** folder contains all frontend files
3. **app.js** contains all JavaScript functions
4. Browser requests files from server
5. Server serves static files from public/

### File Dependencies:
```
server.js (Node.js backend)
└── public/
    ├── index.html (Main page)
    ├── app.js (All functions) ⭐
    ├── barodatek-analytics.js (Analytics)
    ├── api-explorer.html (API testing)
    └── test-*.html (Test pages)
```

### Critical Files:
- ✅ `server.js` - MUST be running
- ✅ `public/app.js` - Contains all functions
- ✅ `public/index.html` - Main interface
- ✅ `node_modules/` - Required dependencies

---

## 🔑 Key Points to Remember

1. **Server MUST be running** - Use `node server.js`
2. **Cache is your enemy** - Always hard reload after changes
3. **Port is 8080** - Not 3000, not 80, but 8080
4. **Check console** - F12 shows all errors
5. **Functions in app.js** - All buttons depend on this file loading

---

## ✨ Success Criteria

Your system is working correctly when:
- ✅ Server starts without errors
- ✅ http://localhost:8080 loads homepage
- ✅ No console errors (F12 → Console)
- ✅ All buttons are clickable and respond
- ✅ Downloads create real files (ZIP, JSON, etc.)
- ✅ Games are interactive
- ✅ API Explorer can test endpoints
- ✅ No "function not defined" errors

---

**Last Updated**: October 14, 2025  
**Project**: BarodaTek API Mock Contract MVP  
**Status**: All issues identified and documented
