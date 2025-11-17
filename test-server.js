// Simple test to check if Node.js works
console.log('Node.js is working!');
console.log('Node version:', process.version);
console.log('Current directory:', __dirname);

// Try to require express
try {
  const express = require('express');
  console.log('✅ Express is available');
} catch (error) {
  console.log('❌ Express not found - run: npm install');
}


