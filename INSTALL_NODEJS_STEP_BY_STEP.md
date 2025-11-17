# 📥 How to Install Node.js - Step by Step

## Method 1: Download from Website (Easiest - Recommended)

### Step 1: Open Your Web Browser
- Open Safari, Chrome, or Firefox
- Any browser works!

### Step 2: Go to the Node.js Website
- In the address bar, type: **nodejs.org**
- Press Enter
- You'll see the Node.js homepage

### Step 3: Download Node.js
- You'll see a big green button that says **"Download Node.js (LTS)"**
- LTS means "Long Term Support" - this is the stable version
- **Click that green button**
- The download will start automatically

### Step 4: Find the Downloaded File
- The file will be in your **Downloads folder**
- It's called something like: `node-v20.x.x.pkg` (the numbers might be different)
- You can find it by:
  - Opening Finder
  - Clicking "Downloads" in the sidebar
  - Or pressing Cmd+Option+L

### Step 5: Install Node.js
1. **Double-click the downloaded file** (the .pkg file)
2. A window will open saying "Node.js Installer"
3. Click **"Continue"**
4. Click **"Continue"** again (on the license agreement)
5. Click **"Agree"** (to accept the license)
6. Click **"Install"**
7. You'll be asked for your password (your Mac login password)
8. Enter your password and click **"Install Software"**
9. Wait for it to install (takes about 1-2 minutes)
10. When you see **"The installation was successful"**, click **"Close"**

### Step 6: Restart Terminal
- **Close Terminal completely** (Quit Terminal from the menu, or press Cmd+Q)
- **Open Terminal again** (Cmd+Space, type "Terminal")

### Step 7: Verify Installation
- In Terminal, type: `node --version`
- Press Enter
- **You should see:** `v20.x.x` (or similar version number)
- **If you see this:** ✅ Node.js is installed correctly!

---

## Method 2: Using Homebrew (If You Have It)

If you already use Homebrew, you can install Node.js with:

```bash
brew install node
```

But if you don't know what Homebrew is, use Method 1 instead!

---

## After Installing Node.js

Once Node.js is installed, you can start your server:

1. Open Terminal
2. Type: `cd ~/Desktop/Cursor/Portfolio`
3. Press Enter
4. Type: `npm install`
5. Press Enter (wait 1-2 minutes)
6. Type: `npm start`
7. Press Enter
8. You should see: "Server running on http://localhost:3000"

---

## Troubleshooting

### "I can't find the downloaded file"
- Check your Downloads folder
- Or check your browser's download history
- The file ends in `.pkg`

### "It asks for my password"
- This is normal! Enter your Mac login password
- This is required to install software on your Mac

### "I see 'command not found' after installing"
- Make sure you **restarted Terminal** after installing
- Close Terminal completely and open it again

### "The installer won't open"
- Right-click the .pkg file
- Choose "Open"
- Click "Open" when it warns you about opening from the internet

---

## Need More Help?

If you get stuck at any step, tell me:
- Which step you're on
- What you see on your screen
- Any error messages


