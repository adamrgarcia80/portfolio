# How to Start the Server

## Quick Start

1. **Open Terminal** (Applications → Utilities → Terminal, or press Cmd+Space and type "Terminal")

2. **Navigate to the project folder:**
   ```bash
   cd ~/Desktop/Cursor/Portfolio
   ```

3. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **You should see:**
   ```
   Server running on http://localhost:3000
   ```

6. **Keep the terminal window open** - the server needs to keep running.

7. **Open your browser** and go to:
   - Portfolio: http://localhost:3000
   - Admin: http://localhost:3000/admin.html

## Troubleshooting

- If you see "command not found: npm", you need to install Node.js first from https://nodejs.org/
- If port 3000 is already in use, the server will try a different port (check the terminal output)
- Make sure you're accessing via `http://localhost:3000` not `file://`


