#!/bin/bash
echo "🎨 Starting Pan Omkar Logistics Frontend..."
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install
fi

echo ""
echo "✅ Frontend starting on http://localhost:3000"
echo "   (Make sure backend is running on port 5000 first)"
echo ""
npm start
