#!/bin/bash

echo "🚀 Starting Portfolio Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "1. Go to https://nodejs.org/"
    echo "2. Download and install Node.js"
    echo "3. Restart Terminal"
    echo "4. Run this script again"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed!"
    echo "Please install Node.js (npm comes with it)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (first time only)..."
    npm install
    echo ""
fi

echo "🌟 Starting server..."
echo "📍 Server will be available at: http://localhost:3000"
echo "📍 Admin panel: http://localhost:3000/admin.html"
echo ""
echo "⚠️  Keep this window open while using the admin panel!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start


