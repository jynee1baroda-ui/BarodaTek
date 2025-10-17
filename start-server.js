#!/usr/bin/env node
// Optional tiny starter for Windows users who prefer `node start-server.js`
// Starts the server and prints a clear message; used by run-matchmaking-tests.ps1 if desired.

const { spawn } = require('child_process');

const child = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  console.log(`[start-server] server.js exited with code ${code}`);
});
