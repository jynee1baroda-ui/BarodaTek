# Fix all broken characters and paths in index.html

$filePath = "c:\NewpROJEKTAI\public\index.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Fix broken emoji in hero section (line 462) - Replace ?? with ⚡
$content = $content -replace '(\s+)\?\?\s+<span class="feature-highlight"', '$1⚡ <span class="feature-highlight"'
$content = $content -replace '</span>\s+\?\?<br>', '</span> ⚡<br>'

# Fix broken emoji in About nav link
$content = $content -replace '<a class="nav-link" href="about\.html">[^<]+About</a>', '<a class="nav-link" href="#about">👨‍💻 About</a>'

# Update fonts from Orbitron to Space Mono in hero
$content = $content -replace "font-family: 'Orbitron', sans-serif;", "font-family: 'Space Mono', monospace;"

# Update neon colors to minimalist palette
$content = $content -replace 'var\(--neon-cyan\)', 'var(--primary-cyan)'
$content = $content -replace 'var\(--neon-magenta\)', 'var(--primary-pink)'
$content = $content -replace 'var\(--neon-yellow\)', 'var(--accent-yellow)'
$content = $content -replace 'var\(--neon-green\)', 'var(--accent-green)'

# Save the fixed content
$content | Set-Content $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ Fixed broken characters in index.html" -ForegroundColor Green
Write-Host "✅ Updated fonts to Space Mono" -ForegroundColor Green
Write-Host "✅ Updated color variables" -ForegroundColor Green
Write-Host "✅ Fixed navigation links" -ForegroundColor Green
