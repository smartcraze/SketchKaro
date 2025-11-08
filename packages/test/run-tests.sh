#!/usr/bin/env bash

# Test Runner Script for SketchKaro
# This script helps run the test suite with proper setup

echo "🧪 SketchKaro Test Suite"
echo "======================="
echo ""

# Check if servers are running
echo "Checking if servers are running..."

# Check WebSocket server (port 8080)
if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ WebSocket server is not running on port 8080"
    echo "   Start it with: cd apps/ws-backend && bun run dev"
    exit 1
fi
echo "✅ WebSocket server is running"

# Check HTTP server (port 3001)
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "❌ HTTP server is not running on port 3001"
    echo "   Start it with: cd apps/http-backend && bun run dev"
    exit 1
fi
echo "✅ HTTP server is running"

echo ""
echo "Running tests..."
echo ""

# Run the tests
bun test "$@"
