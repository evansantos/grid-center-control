#!/bin/bash
# Grid Dashboard — production mode (more stable than dev server)
cd "$(dirname "$0")/app"

if [ ! -d ".next" ] || [ "$1" = "--build" ]; then
  echo "🔴 Building Grid Dashboard..."
  npm run build 2>&1
fi

echo "🔴 Starting Grid Dashboard on http://localhost:3000"
exec npm run start
