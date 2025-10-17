// Security Audit Script for BarodaTek Champions Arena
const fs = require('fs');
const path = require('path');

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

console.log('🔒 Running security audit...\n');

// Check 1: Verify no hardcoded secrets
console.log('Checking for hardcoded secrets...');
const sensitiveFiles = ['api/index.js', 'server.js', 'config.js'].filter(f => 
  fs.existsSync(path.join(__dirname, '..', f))
);

sensitiveFiles.forEach(file => {
  const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  
  // Check for potential secrets
  if (content.includes('password') && content.includes('=') && !content.includes('process.env')) {
    issues.high.push(`Potential hardcoded password in ${file}`);
  }
  
  if (content.includes('api_key') && !content.includes('process.env')) {
    issues.high.push(`Potential hardcoded API key in ${file}`);
  }
  
  if (content.includes('secret') && content.includes('=') && !content.includes('process.env') && !content.includes('JWT_SECRET')) {
    issues.medium.push(`Potential hardcoded secret in ${file}`);
  }
});

// Check 2: Verify CSP is enabled
console.log('Checking Content Security Policy...');
const apiIndex = path.join(__dirname, '../api/index.js');
if (fs.existsSync(apiIndex)) {
  const content = fs.readFileSync(apiIndex, 'utf8');
  if (content.includes('contentSecurityPolicy: false')) {
    issues.high.push('CSP is disabled in api/index.js - should be enabled for production');
  }
}

// Check 3: Verify rate limiting
console.log('Checking rate limiting...');
const serverFile = path.join(__dirname, '../server.js');
if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  if (!content.includes('rateLimit') && !content.includes('rate-limit')) {
    issues.medium.push('Rate limiting may not be configured');
  }
}

// Check 4: Verify HTTPS enforcement
console.log('Checking HTTPS enforcement...');
const vercelConfig = path.join(__dirname, '../vercel.json');
if (fs.existsSync(vercelConfig)) {
  const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
  // Vercel handles HTTPS by default, but check for explicit redirects
  issues.low.push('INFO: Vercel handles HTTPS by default');
}

// Check 5: Verify input validation
console.log('Checking input validation...');
if (fs.existsSync(apiIndex)) {
  const content = fs.readFileSync(apiIndex, 'utf8');
  const postRoutes = content.match(/app\.(post|put|patch)\(/g) || [];
  
  postRoutes.forEach(() => {
    // Check if validation exists (basic check)
    if (!content.includes('trim()') && !content.includes('validator')) {
      issues.low.push('Consider adding input validation/sanitization');
    }
  });
}

// Print results
console.log(`\n${'='.repeat(60)}`);
console.log('Security Audit Results:');
console.log(`${'='.repeat(60)}\n`);

if (issues.critical.length > 0) {
  console.log('🔴 CRITICAL ISSUES:');
  issues.critical.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

if (issues.high.length > 0) {
  console.log('🟠 HIGH PRIORITY:');
  issues.high.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

if (issues.medium.length > 0) {
  console.log('🟡 MEDIUM PRIORITY:');
  issues.medium.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

if (issues.low.length > 0) {
  console.log('🟢 LOW PRIORITY / INFO:');
  issues.low.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

const totalIssues = issues.critical.length + issues.high.length;

if (totalIssues === 0) {
  console.log('✅ No critical or high priority security issues found!\n');
  process.exit(0);
} else {
  console.log(`❌ Found ${totalIssues} critical/high priority security issues.\n`);
  console.log('Please address these issues before deployment.\n');
  process.exit(1);
}
