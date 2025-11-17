# 🚨 START THE SERVER - EXACT STEPS

## The server is NOT running. Here's how to start it:

### ⚠️ FIRST: Do you have Node.js installed?

**Test this:**
1. Open Terminal (Cmd+Space, type "Terminal")
2. Type exactly this: `node --version`
3. Press Enter

**What do you see?**
- ✅ **If you see a number** (like `v20.10.0`) → Node.js is installed! Go to "STEP 2" below
- ❌ **If you see "command not found"** → You MUST install Node.js first:
  1. Open your web browser
  2. Go to: **https://nodejs.org/**
  3. Click the big green **"Download Node.js (LTS)"** button
  4. Open the downloaded file and install it
  5. **RESTART Terminal** (close it completely and open it again)
  6. Test again with `node --version`
  7. Once you see a version number, come back here

---

### STEP 2: Start the Server

**Open Terminal** and copy/paste these commands ONE AT A TIME:

#### Command 1: Go to your project
```bash
cd ~/Desktop/Cursor/Portfolio
```
Press Enter

#### Command 2: Install dependencies (first time only - skip if you already did this)
```bash
npm install
```
Press Enter and **WAIT** (takes 1-2 minutes)
You should see "added X packages" when done

#### Command 3: Start the server
```bash
npm start
```
Press Enter

#### ✅ SUCCESS! You should see:
```
Server running on http://localhost:3000
```

**⚠️ IMPORTANT:** Keep this Terminal window open! Don't close it!

---

### STEP 3: Use the Admin Panel

1. Open your web browser
2. Go to: **http://localhost:3000/admin.html**
3. You should see: **"✓ Server connected"** in green
4. Enter password: **admin123**
5. Click **"Access"**

---

## 🆘 Still Not Working?

**Tell me exactly what happens:**

1. When you type `node --version`, what do you see?
2. When you type `npm start`, what do you see?
3. Are there any error messages? (Copy and paste them)

---

## 💡 Common Mistakes:

- ❌ Closing Terminal after starting the server (server stops!)
- ❌ Not installing Node.js first
- ❌ Accessing file:// instead of http://localhost:3000
- ❌ Not waiting for `npm install` to finish


