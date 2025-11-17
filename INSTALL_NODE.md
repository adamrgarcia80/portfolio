# How to Install Node.js and Start the Server

## Option 1: Download from Website (Easiest)

1. **Go to:** https://nodejs.org/
2. **Download the LTS version** (recommended)
3. **Run the installer** and follow the instructions
4. **Restart your terminal** after installation
5. **Then come back here and follow the "Start the Server" steps below**

## Option 2: Using Homebrew (if you have it)

If you have Homebrew installed, you can run:
```bash
brew install node
```

## After Installing Node.js

1. **Open Terminal** (Cmd+Space, type "Terminal")

2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers.

3. **Navigate to your project:**
   ```bash
   cd ~/Desktop/Cursor/Portfolio
   ```

4. **Install project dependencies:**
   ```bash
   npm install
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Keep the terminal open** and refresh your admin page!

## Troubleshooting

- If commands don't work after installing, **restart your terminal**
- Make sure you're in the correct folder: `~/Desktop/Cursor/Portfolio`
- The server must stay running - don't close the terminal window


