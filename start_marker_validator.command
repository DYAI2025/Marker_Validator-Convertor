#!/bin/bash

# Marker Validator & Converter Tool - Quick Start Script

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the CLI directory
cd "$DIR/packages/cli"

# Show help by default
echo "🎯 Marker Validator & Converter Tool"
echo "===================================="
echo ""
echo "Examples:"
echo "  Validate files:"
echo "    node bin/cli.js validate examples/good/*.yaml"
echo ""
echo "  Convert files:"
echo "    node bin/cli.js convert examples/good/*.yaml -o output/"
echo ""
echo "  Show help:"
echo "    node bin/cli.js --help"
echo ""
echo "Starting in CLI directory..."
echo ""

# Start an interactive shell in the CLI directory
exec $SHELL 