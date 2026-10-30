#!/usr/bin/env bash
# CLI version of the repro: `playwright cli snapshot` vs `ariaSnapshot()` on the same page.
# The CLI blocks file: URLs, so repro.html is served from a throwaway local server.
set -euo pipefail
cd "$(dirname "$0")"
PORT=${PORT:-8765}
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; wait $SERVER 2>/dev/null; npx playwright cli -s=repro close >/dev/null 2>&1 || true' EXIT
sleep 1
npx playwright cli -s=repro open "http://127.0.0.1:$PORT/repro.html" >/dev/null
echo "=== npx playwright cli snapshot"
npx playwright cli -s=repro snapshot | grep -E "region|navigation|dialog|columnheader|table|caption" || true
echo
echo "=== locator('main').ariaSnapshot() (default mode)"
# run-code prints the returned string JSON-encoded on one line: decode it, then keep the same roles.
npx playwright cli -s=repro run-code "async page => page.locator('main').ariaSnapshot()" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const l=d.split('\n').find(x=>x.startsWith('\"'));console.log(l?JSON.parse(l):d)})" \
  | grep -E "region|navigation|dialog|columnheader|table|caption" || true
