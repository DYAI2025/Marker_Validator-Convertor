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
echo "Quick Commands:"
echo "  Validate all project files:"
echo "    node bin/cli.js validate-all"
echo ""
echo "  Repair all project files:"
echo "    node bin/cli.js repair-all"
echo ""
echo "  Detect file types:"
echo "    node bin/cli.js detect examples/*"
echo ""
echo "  Show configuration:"
echo "    node bin/cli.js info"
echo ""
echo "  Show full help:"
echo "    node bin/cli.js --help"
echo ""
echo "Starting in CLI directory..."
echo ""

# Start an interactive shell in the CLI directory
exec $SHELL 