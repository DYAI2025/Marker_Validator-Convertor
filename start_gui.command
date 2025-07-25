#!/bin/bash

# Marker Validator GUI - Quick Start Script

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the GUI directory
cd "$DIR/packages/gui"

echo "🎯 Marker Validator GUI (Web Version)"
echo "====================================="
echo ""
echo "Starting the web application..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$DIR"
    pnpm install
    cd "$DIR/packages/gui"
fi

# Start the GUI
echo "🚀 Launching web application..."
echo "The application will open in your default browser."
echo "If it doesn't open automatically, go to: http://localhost:3000"
echo ""
pnpm start 