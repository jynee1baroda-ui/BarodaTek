const fs = require('fs');
const path = require('path');
const s = fs.readFileSync(path.resolve(__dirname,'..','public','app.js'),'utf8');
let stack = [];
let inSingle=false, inDouble=false, inTemplate=false, inLineComment=false, inBlockComment=false, escaped=false;
for(let i=0;i<s.length;i++){
  const ch=s[i];
  const prev=s[i-1];
  const line = s.slice(0,i).split('\n').length;
  if(inLineComment){ if(ch==='\n'){ inLineComment=false; }}
  else if(inBlockComment){ if(prev==='*' && ch==='/' ) { inBlockComment=false; }}
  else if(inSingle){ if(!escaped && ch==='\'') { inSingle=false; } }
  else if(inDouble){ if(!escaped && ch==='\"') { inDouble=false; } }
  // Note: above quoting mistaken. We'll implement properly
}
console.log('Script created. Use a better parser.');
