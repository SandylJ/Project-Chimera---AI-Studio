#!/bin/bash
# Party Idle launcher — starts the Vite dev server if needed and opens the browser.

set -u

PROJECT_DIR="/Users/patrickjanuszyk/Desktop/Claude/Project-Chimera---AI-Studio"
LOG="/tmp/party-idle.log"

# nvm node path — adjust here if nvm version changes
export PATH="/Users/patrickjanuszyk/.nvm/versions/node/v22.18.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$PROJECT_DIR" || exit 1

# If a Party Idle dev server is already running, just open it.
# (Must match the actual game, not some unrelated server on the same port.)
for P in 3000 3001 3002 3003; do
  BODY=$(curl -s --max-time 1 "http://localhost:$P/" 2>/dev/null)
  if echo "$BODY" | grep -q "Party Idle"; then
    open "http://localhost:$P/"
    exit 0
  fi
done

# Otherwise start a fresh server, detached.
: > "$LOG"
nohup npm run dev > "$LOG" 2>&1 &
disown

# Wait for Vite to print its port (up to ~15s).
for i in $(seq 1 30); do
  sleep 0.5
  PORT=$(grep -oE 'localhost:[0-9]+' "$LOG" | head -n 1 | cut -d: -f2)
  if [ -n "${PORT:-}" ]; then
    open "http://localhost:$PORT/"
    exit 0
  fi
done

osascript -e "display dialog \"Party Idle server didn't start in 15s. See $LOG\" buttons {\"OK\"} default button 1"
exit 1
