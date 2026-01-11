#!/bin/bash

# Hotel Contract Intelligence - Production Deployment Script
# For use with Easypanel/Coolify on DigitalOcean VPS

set -e

echo "🏨 Hotel Contract Intelligence Dashboard - Deployment Script"
echo "============================================================="

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js version must be 20 or higher"
    echo "Current version: $(node -v)"
    echo "Install Node 20 with: nvm install 20 && nvm use 20"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --production=false

# Build the application
echo ""
echo "🔨 Building Next.js application..."
npm run build

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo ""
echo "============================================================="
echo "🚀 Deployment ready!"
echo ""
echo "Next steps:"
echo "1. Set environment variable: OPENAI_API_KEY"
echo "2. Start production server: npm start"
echo "3. Access at: http://your-domain.com"
echo "============================================================="
