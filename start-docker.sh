#!/bin/bash

# Marker Validator Docker Start Script

echo "🐳 Marker Validator Docker"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [MODE]"
    echo ""
    echo "Modes:"
    echo "  cli       - Run CLI validation (default)"
    echo "  external  - Validate external markers from MEWT project"
    echo "  build     - Build Docker image only"
    echo "  clean     - Clean up Docker containers and images"
    echo ""
    echo "Examples:"
    echo "  $0 cli"
    echo "  $0 external"
}

# Function to build image
build_image() {
    echo "🔨 Building Docker image..."
    docker build -t marker-validator .
    if [ $? -eq 0 ]; then
        echo "✅ Image built successfully!"
    else
        echo "❌ Failed to build image"
        exit 1
    fi
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down --remove-orphans
    docker system prune -f
    echo "✅ Cleanup complete!"
}

# Function to run CLI
run_cli() {
    echo "🚀 Starting CLI mode..."
    docker-compose --profile cli up --build
}

# Function to run external markers validation
run_external() {
    echo "🚀 Starting external markers validation..."
    echo "📁 Validating markers from: /Users/benjaminpoersch/Projekte/_01#Project_MEWT_Wordthread/_1#MEWT_BACKEND/Backend_ME_alias/markers/markers:JSON/"
    echo "📊 Results will be saved to: ./out/external-validation"
    docker-compose --profile external up --build
}

# Main script logic
case "${1:-cli}" in
    "cli")
        build_image
        run_cli
        ;;
    "external")
        build_image
        run_external
        ;;
    "build")
        build_image
        ;;
    "clean")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown mode: $1"
        show_usage
        exit 1
        ;;
esac
