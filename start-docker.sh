#!/bin/bash

# Docker React-NestJS-MySQL Application Startup Script

echo "=================================="
echo "Docker Application Startup Script"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask user for mode
echo "Select mode:"
echo "1) Production (optimized builds, Nginx)"
echo "2) Development (hot reload, Vite dev server)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting in PRODUCTION mode..."
        echo ""
        docker-compose up --build
        ;;
    2)
        echo ""
        echo "🚀 Starting in DEVELOPMENT mode..."
        echo ""
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

