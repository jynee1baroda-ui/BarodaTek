const fs = require('fs');
const s = fs.readFileSync('c:\\NewpROJEKTAI\\public\\app.js','utf8');
let inSingle=false, inDouble=false, inTemplate=false, inLine=false, inBlock=false, escaped=false;
let paren=0, brace=0, bracket=0;
for(let i=0;i<s.length;i++){
  const ch = s[i];
  const prev = s[i-1];
  if(inLine){ if(ch==='\n'){ inLine=false; escaped=false;} else continue; }
  if(inBlock){ if(prev==='*' && ch==='/'){ inBlock=false; escaped=false;} else continue; }
  if(inSingle){ if(!escaped && ch==="'") inSingle=false; if(ch==='\\' && !escaped) escaped=true; else escaped=false; continue; }
  if(inDouble){ if(!escaped && ch==='"') inDouble=false; if(ch==='\\' && !escaped) escaped=true; else escaped=false; continue; }
  if(inTemplate){ if(!escaped && ch==='`') inTemplate=false; if(ch==='\\' && !escaped) escaped=true; else escaped=false; continue; }

  if(ch==='/'){
    const n = s[i+1];
    if(n==='/' ){ inLine=true; i++; continue; }
    if(n==='*'){ inBlock=true; i++; continue; }
  }
  if(ch==="'") { inSingle=true; continue; }
  if(ch==='"') { inDouble=true; continue; }
  if(ch==='`') { inTemplate=true; continue; }
  if(ch==='(') paren++;
  if(ch===')') paren--;
  if(ch==='{') brace++;
  if(ch==='}') brace--;
  if(ch==='[') bracket++;
  if(ch===']') bracket--;
}
console.log('paren',paren,'brace',brace,'bracket',bracket,'inSingle',inSingle,'inDouble',inDouble,'inTemplate',inTemplate,'inLine',inLine,'inBlock',inBlock);
