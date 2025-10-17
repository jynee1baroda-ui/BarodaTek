// Link Checker Script for BarodaTek Champions Arena
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const results = {
  checked: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

// Extract links from HTML files
function extractLinksFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return [...new Set(links)]; // Remove duplicates
}

// Check if URL is accessible
function checkURL(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { timeout: 5000 }, (res) => {
      const status = res.statusCode;
      resolve({ url, status, ok: status >= 200 && status < 400 });
    });
    
    request.on('error', (err) => {
      resolve({ url, status: 0, ok: false, error: err.message });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({ url, status: 0, ok: false, error: 'Timeout' });
    });
  });
}

async function main() {
  console.log('🔗 Starting link check...\n');
  
  // Find HTML files
  const htmlFiles = [
    path.join(__dirname, '../index.html'),
    path.join(__dirname, '../about.html'),
    path.join(__dirname, '../pricing.html'),
    path.join(__dirname, '../dev-tools.html')
  ].filter(fs.existsSync);
  
  const allLinks = [];
  
  htmlFiles.forEach(file => {
    const links = extractLinksFromHTML(file);
    console.log(`Found ${links.length} external links in ${path.basename(file)}`);
    allLinks.push(...links);
  });
  
  const uniqueLinks = [...new Set(allLinks)];
  console.log(`\nChecking ${uniqueLinks.length} unique external links...\n`);
  
  for (const link of uniqueLinks) {
    results.checked++;
    const result = await checkURL(link);
    
    if (result.ok) {
      results.passed++;
      console.log(`✅ ${result.status} - ${link}`);
    } else {
      results.failed++;
      results.errors.push(result);
      console.log(`❌ ${result.status || 'ERROR'} - ${link} - ${result.error || ''}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Link Check Summary:`);
  console.log(`Total checked: ${results.checked}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (results.failed > 0) {
    console.log('❌ Link check failed. Please fix broken links before deployment.\n');
    process.exit(1);
  } else {
    console.log('✅ All links are valid!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Link checker error:', err);
  process.exit(1);
});
