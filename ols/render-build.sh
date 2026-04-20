#!/bin/bash
# Render build script for Dhakshitha Pickles backend
set -e
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo "✅ Build complete!"
