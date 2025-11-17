# 🔍 Debugging Guide

## Let's figure out what's wrong!

### Test 1: Is Node.js installed?

Open Terminal and type:
```bash
node --version
```

**If you see:** A version number (like `v20.10.0`) → ✅ Node.js is installed!
**If you see:** `command not found` → ❌ You need to install Node.js from https://nodejs.org/

---

### Test 2: Can Node.js run a simple script?

In Terminal, type:
```bash
cd ~/Desktop/Cursor/Portfolio
node test-server.js
```

**If you see:** "Node.js is working!" → ✅ Node.js works!
**If you see:** "Express not found" → You need to run `npm install` first
**If you see:** An error → Share the error message

---

### Test 3: Are dependencies installed?

In Terminal, type:
```bash
cd ~/Desktop/Cursor/Portfolio
ls node_modules
```

**If you see:** A list of folders → ✅ Dependencies are installed!
**If you see:** "No such file or directory" → Run `npm install` first

---

### Test 4: Try starting the server

In Terminal, type:
```bash
cd ~/Desktop/Cursor/Portfolio
npm start
```

**What do you see?**
- "Server running on http://localhost:3000" → ✅ Server is running!
- An error message → Copy and paste the error here
- Nothing happens → Something is wrong

---

## Common Issues:

### Issue 1: "command not found: node"
**Solution:** Install Node.js from https://nodejs.org/

### Issue 2: "Cannot find module 'express'"
**Solution:** Run `npm install` in the project folder

### Issue 3: "Port 3000 is already in use"
**Solution:** Another program is using port 3000. Close it or change the port in server.js

### Issue 4: Server starts but admin page says "not connected"
**Solution:** Make sure you're accessing http://localhost:3000/admin.html (not file://)

---

## Still stuck?

Please share:
1. What you see when you type `node --version`
2. What you see when you type `npm start`
3. Any error messages


