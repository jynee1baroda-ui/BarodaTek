const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'public', 'app.js');
const text = fs.readFileSync(file, 'utf8');
let count = 0;
const lines = text.split(/\r?\n/);
lines.forEach((ln, idx) => {
  const m = ln.match(/`/g);
  if (m) {
    count += m.length;
    console.log(`Line ${idx+1}: ${m.length} backtick(s)`);
  }
});
console.log('\nTotal backticks:', count);

// Find first unbalanced by scanning characters
let stack = [];
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (ch === '`') {
    if (stack.length && stack[stack.length-1] === '`') {
      stack.pop();
    } else {
      stack.push('`');
    }
  }
}
console.log('Unmatched backticks on stack:', stack.length);
