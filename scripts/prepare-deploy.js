#!/usr/bin/env node
/**
 * 🚀 BarodaTek Arena Deployment Preparation Script
 * 
 * This script prepares your static site for production deployment by:
 * 1. Creating a timestamped version file
 * 2. Adding cache-busting query parameters to assets
 * 3. Validating all critical files exist
 * 4. Generating deployment manifest
 */

const fs = require('fs');
const path = require('path');

const TIMESTAMP = new Date().toISOString();
const VERSION = new Date().toISOString().split('T')[0].replace(/-/g, '');

console.log('🎮 BarodaTek Arena - Deployment Preparation');
console.log('═══════════════════════════════════════════');
console.log(`📅 Timestamp: ${TIMESTAMP}`);
console.log(`🔢 Version: ${VERSION}`);
console.log('');

// Step 1: Create version.json for cache-busting
console.log('📝 Creating version.json...');
const versionData = {
  version: VERSION,
  timestamp: TIMESTAMP,
  deployedAt: new Date().toLocaleString('en-US', { 
    timeZone: 'America/Los_Angeles',
    dateStyle: 'full',
    timeStyle: 'long'
  }),
  site: 'BarodaTek Arena',
  status: 'live'
};

fs.writeFileSync(
  path.join(__dirname, '..', 'version.json'),
  JSON.stringify(versionData, null, 2)
);
console.log('✅ version.json created');

// Step 2: Validate critical files
console.log('');
console.log('🔍 Validating deployment files...');

const criticalFiles = [
  'index.html',
  'barodatek-logo.png',
  'profile.jpg',
  'vercel.json'
];

let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  ✅ ${file} (${sizeKB} KB)`);
  } else {
    console.log(`  ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('');
  console.error('❌ Deployment validation failed! Missing critical files.');
  process.exit(1);
}

// Step 3: Check for node_modules and large folders to exclude
console.log('');
console.log('📦 Checking project structure...');

const excludeDirs = ['node_modules', 'arena_rebrand', '.git', '.vercel'];
excludeDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ⚠️  ${dir} exists (will be excluded from deployment)`);
  }
});

// Step 4: Generate deployment manifest
console.log('');
console.log('📋 Generating deployment manifest...');

const manifest = {
  deploymentId: `deploy-${VERSION}`,
  timestamp: TIMESTAMP,
  files: criticalFiles.map(file => ({
    name: file,
    size: fs.statSync(path.join(__dirname, '..', file)).size,
    modified: fs.statSync(path.join(__dirname, '..', file)).mtime
  })),
  notes: 'BarodaTek Arena - Bootstrap Edition (No build process)',
  tech: ['HTML', 'Bootstrap 5', 'Vanilla JavaScript', 'Plain CSS']
};

fs.writeFileSync(
  path.join(__dirname, '..', 'deployment-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ deployment-manifest.json created');

// Step 5: Success summary
console.log('');
console.log('═══════════════════════════════════════════');
console.log('✅ Deployment preparation complete!');
console.log('');
console.log('📤 Ready to deploy:');
console.log('   vercel --prod');
console.log('');
console.log('🌐 Or use combined command:');
console.log('   npm run deploy');
console.log('═══════════════════════════════════════════');
