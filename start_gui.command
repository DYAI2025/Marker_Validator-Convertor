#!/bin/bash

# Marker Validator GUI - Quick Start Script

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🎯 Marker Validator GUI (Web Version)"
echo "====================================="
echo ""
echo "Starting the web application..."
echo ""

# Change to the project directory
cd "$DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Check if GUI dependencies are installed
if [ ! -d "packages/gui/node_modules" ]; then
    echo "📦 Installing GUI dependencies..."
    cd packages/gui
    pnpm install
    cd "$DIR"
fi

# Check if server is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ GUI is already running at http://localhost:3000"
    echo "Opening in browser..."
    open http://localhost:3000
    exit 0
fi

# Start the GUI
echo "🚀 Launching web application..."
echo "The application will open in your default browser."
echo "If it doesn't open automatically, go to: http://localhost:3000"
echo ""

cd packages/gui
pnpm start 