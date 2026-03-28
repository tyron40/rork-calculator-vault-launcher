#!/bin/bash

# Test Backend Connection Script
# Usage: bash scripts/test-backend.sh

echo "🔍 Testing Backend Connection..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your backend URL:"
    echo "EXPO_PUBLIC_RORK_API_BASE_URL=https://your-app.vercel.app"
    exit 1
fi

# Read backend URL from .env
BACKEND_URL=$(grep EXPO_PUBLIC_RORK_API_BASE_URL .env | cut -d '=' -f2)

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Error: EXPO_PUBLIC_RORK_API_BASE_URL not set in .env"
    exit 1
fi

echo "📡 Testing: $BACKEND_URL/api"
echo ""

# Test health endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api")

if [ "$RESPONSE" -eq 200 ]; then
    echo "✅ Backend is online and responding!"
    echo ""
    echo "Response:"
    curl -s "$BACKEND_URL/api" | jq .
else
    echo "❌ Backend returned HTTP $RESPONSE"
    echo "Expected: 200"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if backend is deployed: vercel ls"
    echo "2. Verify URL in .env is correct"
    echo "3. Redeploy: vercel --prod"
fi
