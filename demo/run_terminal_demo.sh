#!/bin/bash
set -e

echo -e "\033[1;34m[System]\033[0m Starting Target Application (SkyBoost Travel)..."
cd demo/testweb
npm run dev -- --port=3000 > /dev/null 2>&1 &
APP_PID=$!
sleep 4

echo -e "\033[1;34m[System]\033[0m Target Application live on http://localhost:3000"
echo -e "\033[1;34m[System]\033[0m Initializing Repatrol Swarm..."
sleep 2

cd ../..
npm run build > /dev/null 2>&1

TARGET_GAME_URL=http://localhost:3000 npx tsx scripts/run-demo.ts --mode demo --headless --dry-run-github

echo -e "\n\033[1;34m[System]\033[0m Shutting down target application..."
kill $APP_PID 2>/dev/null || true
echo -e "\033[1;32m[System]\033[0m Demo complete."