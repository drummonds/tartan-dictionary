#!/usr/bin/env bash
# shot.sh — screenshot a page with Firefox under a virtual X display.
#
# Gotchas on this box, all handled here:
#   1. `firefox --headless --screenshot` alone fails with
#      "RenderCompositorSWGL failed mapping default framebuffer" — no framebuffer.
#   2. `xvfb-run` wrapping Firefox hangs indefinitely; a manually-managed Xvfb works.
#   3. A stale /tmp/.X<n>-lock makes Xvfb exit at once, leaving Firefox displayless
#      and hung — so we pick a free display and confirm Xvfb is actually up.
#
# Usage: scripts/shot.sh <url> [out.png] [width] [height]
#   scripts/shot.sh http://localhost:1313/ /tmp/claude/nav.png 1280 600
set -euo pipefail

url="${1:?usage: shot.sh <url> [out.png] [width] [height]}"
out="${2:-/tmp/claude/shot.png}"
w="${3:-1280}"
h="${4:-800}"

command -v Xvfb >/dev/null || { echo "Xvfb missing — run: sudo apt install -y xvfb" >&2; exit 1; }

# Find a free display number (no lock file, no socket).
disp=""
for n in $(seq 90 110); do
  if [ ! -e "/tmp/.X${n}-lock" ] && [ ! -e "/tmp/.X11-unix/X${n}" ]; then disp=":${n}"; break; fi
done
[ -n "$disp" ] || { echo "no free X display found" >&2; exit 1; }

prof="$(mktemp -d)"
Xvfb "$disp" -screen 0 "${w}x${h}x24" >/tmp/claude/xvfb.log 2>&1 &
xvfb_pid=$!
cleanup() { kill -9 "$xvfb_pid" 2>/dev/null || true; rm -rf "$prof"; }
trap cleanup EXIT

# Confirm Xvfb actually came up before launching Firefox.
for _ in $(seq 1 20); do
  [ -e "/tmp/.X11-unix/X${disp#:}" ] && break
  kill -0 "$xvfb_pid" 2>/dev/null || { echo "Xvfb failed to start ($disp):" >&2; tail -3 /tmp/claude/xvfb.log >&2; exit 1; }
  sleep 0.3
done

rm -f "$out"
DISPLAY="$disp" firefox --headless --no-remote --profile "$prof" \
        --window-size="${w},${h}" \
        --screenshot "$out" "$url" >/tmp/claude/ff.log 2>&1 &
ff_pid=$!

# Poll for the file; Firefox lingers after writing, so don't wait on it.
for _ in $(seq 1 60); do
  [ -s "$out" ] && break
  sleep 0.5
done
kill -9 "$ff_pid" 2>/dev/null || true

[ -s "$out" ] && echo "wrote $out ($(stat -c%s "$out") bytes)" || { echo "FAILED: no screenshot" >&2; tail -4 /tmp/claude/ff.log >&2; exit 1; }
