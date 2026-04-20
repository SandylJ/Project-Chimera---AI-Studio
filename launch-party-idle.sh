#!/bin/bash
# Party Idle launcher — starts the Vite dev server if needed and opens the browser.

set -u

PROJECT_DIR="/Users/patrickjanuszyk/Desktop/Claude/Project-Chimera---AI-Studio"
LOG="/tmp/party-idle.log"

# nvm node path — adjust here if nvm version changes
export PATH="/Users/patrickjanuszyk/.nvm/versions/node/v22.18.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

cd "$PROJECT_DIR" || exit 1

# Kill any stale vite — by pattern AND by port — so we never serve old bundles.
pkill -f 'vite.*--port=3000' >/dev/null 2>&1 || true
pkill -f 'node.*vite' >/dev/null 2>&1 || true
for P in 3000 3001 3002 3003; do
  PIDS=$(lsof -ti:$P 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    # Only kill if it's a vite/node process (don't nuke unrelated servers)
    for PID in $PIDS; do
      if ps -p $PID -o command= 2>/dev/null | grep -q -E 'node|vite'; then
        kill $PID 2>/dev/null || true
      fi
    done
  fi
done
sleep 1

# Always start a fresh server so bundles match disk state.
: > "$LOG"
nohup npm run dev > "$LOG" 2>&1 &
disown

# Wait for Vite to print its port (up to ~15s).
for i in $(seq 1 30); do
  sleep 0.5
  PORT=$(grep -oE 'localhost:[0-9]+' "$LOG" | head -n 1 | cut -d: -f2)
  if [ -n "${PORT:-}" ]; then
    # Open in default browser (adding ?fresh=<ts> busts any browser cache)
    TS=$(date +%s)
    open "http://localhost:$PORT/?fresh=$TS"
    exit 0
  fi
done

osascript -e "display dialog \"Party Idle server didn't start in 15s. See $LOG\" buttons {\"OK\"} default button 1"
exit 1
