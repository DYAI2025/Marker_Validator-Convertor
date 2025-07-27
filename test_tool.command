#!/bin/bash

# Test-Skript für das Marker Validator Tool

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🧪 Marker Validator Tool - Test"
echo "================================"
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

echo "🔍 Testing tool functionality..."
echo ""

# Test 1: Show configuration
echo "1️⃣ Testing configuration..."
./packages/cli/bin/cli.js info
echo ""

# Test 2: Validate example files
echo "2️⃣ Testing validation..."
if [ -d "examples" ]; then
    ./packages/cli/bin/cli.js validate examples/good/*.yaml --verbose
else
    echo "No examples directory found, skipping validation test"
fi
echo ""

# Test 3: Test repair functionality
echo "3️⃣ Testing repair functionality..."
if [ -d "examples/bad" ]; then
    ./packages/cli/bin/cli.js repair examples/bad/*.yaml --dry-run --verbose
else
    echo "No bad examples directory found, skipping repair test"
fi
echo ""

# Test 4: Check if GUI can start
echo "4️⃣ Testing GUI startup..."
if [ -d "packages/gui/node_modules" ]; then
    echo "✅ GUI dependencies found"
    echo "   To start GUI: ./start_gui.command"
else
    echo "⚠️  GUI dependencies not found"
    echo "   To install: cd packages/gui && pnpm install"
fi
echo ""

echo "🎉 Test completed!"
echo ""
echo "Next steps:"
echo "  • Start GUI: ./start_gui.command"
echo "  • Use CLI: ./start_marker_validator.command"
echo "  • Validate markers: ./packages/cli/bin/cli.js validate-all"
echo "" 