const fs=require('fs');
const s=fs.readFileSync('c:\\NewpROJEKTAI\\public\\app.js','utf8');
let line=1;
let bracket=0;
let paren=0, brace=0;
const events=[];
for(let i=0;i<s.length;i++){
  const ch=s[i];
  if(ch==='\n') { line++; continue; }
  if(ch==='(') { paren++; events.push({line, type:'(', val:paren}); }
  if(ch===')') { paren--; events.push({line, type:')', val:paren}); }
  if(ch==='{') { brace++; events.push({line, type:'{', val:brace}); }
  if(ch==='}') { brace--; events.push({line, type:'}', val:brace}); }
  if(ch==='[') { bracket++; events.push({line, type:'[', val:bracket}); }
  if(ch===']') { bracket--; events.push({line, type:']', val:bracket}); }
}
console.log('final', {paren, brace, bracket});
const problems = events.filter(e=> (e.type==='[' && e.val>0) || (e.type===']' && e.val<0));
// print last 50 events
console.log('Last 100 bracket events:');
for(const e of events.slice(-200)) console.log(e.line, e.type, e.val);
