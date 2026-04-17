#!/bin/bash
echo "🚚 Starting Pan Omkar Logistics Backend..."
cd "$(dirname "$0")"

# Create virtualenv if needed
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt -q

echo ""
echo "✅ Backend starting on http://localhost:5000"
echo "   Admin:   admin@panomkar.com  / admin123"
echo "   Manager: manager@panomkar.com / manager123"
echo ""
python app.py
