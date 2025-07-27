#!/bin/bash

# Marker Validator CLI - Quick Start Script

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🔧 Marker Validator CLI"
echo "======================="
echo ""
echo "Starting the command-line tool..."
echo ""

# Change to the project directory
cd "$DIR"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Check if CLI dependencies are installed
if [ ! -d "packages/cli/node_modules" ]; then
    echo "📦 Installing CLI dependencies..."
    cd packages/cli
    pnpm install
    cd "$DIR"
fi

# Build the CLI if needed
if [ ! -f "packages/cli/out/cli.js" ]; then
    echo "🔨 Building CLI..."
    cd packages/cli
    pnpm build
    cd "$DIR"
fi

echo "🚀 CLI is ready!"
echo ""
echo "Usage examples:"
echo "  ./packages/cli/bin/cli.js validate markers/"
echo "  ./packages/cli/bin/cli.js repair markers/ --output out/"
echo "  ./packages/cli/bin/cli.js convert markers/ --format json"
echo ""

# Start interactive mode
echo "Starting interactive mode..."
cd packages/cli
node bin/cli.js 