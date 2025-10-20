const fs=require('fs');
const s=fs.readFileSync('c:\\NewpROJEKTAI\\public\\app.js','utf8');
let stack=[];let line=1;let col=0;
for(let i=0;i<s.length;i++){
  const ch=s[i];
  col++;
  if(ch==='\n'){ line++; col=0; continue; }
  if(ch==='"' || ch==="'" || ch==='`'){
    // skip strings
    const quote=ch; i++; col++;
    while(i<s.length){ if(s[i]==='\\'){ i+=2; col+=2; continue;} if(s[i]===quote){ break;} if(s[i]==='\n'){ line++; col=0;} i++; col++;}
    continue;
  }
  if(ch==='/'){
    if(s[i+1]==='/'){ while(i<s.length && s[i]!== '\n') i++; line++; col=0; continue; }
    if(s[i+1]==='*'){ i+=2; col+=2; while(i<s.length && !(s[i-1]==='*' && s[i]==='/')){ if(s[i]==='\n'){ line++; col=0;} i++; col++; } continue; }
  }
  if(ch==='{'){ stack.push({line,col,i}); }
  if(ch==='}'){
    if(stack.length) stack.pop(); else { console.log('Extra closing } at',line,col); }
  }
}
if(stack.length){ console.log('Unclosed { count',stack.length,'first at',stack[0]); } else { console.log('All braces closed'); }
