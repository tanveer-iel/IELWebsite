#!/usr/bin/env bash
# Build the site from a local (non-Drive) mirror.
# node_modules cannot be installed on Google Drive (EBADF write errors, slow sync),
# so install + build happen in C:/dev/iel-build and the output is copied to ./dist.
# Usage: scripts/local-build.sh [build|preview]
set -euo pipefail
MIRROR="C:/dev/iel-build"
SRC="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$MIRROR"
cp "$SRC/package.json" "$SRC/package-lock.json" "$SRC/astro.config.mjs" "$MIRROR/"
rm -rf "$MIRROR/src" && cp -r "$SRC/src" "$MIRROR/src"
rm -rf "$MIRROR/public" && cp -r "$SRC/public" "$MIRROR/public"
cd "$MIRROR"
[ -d node_modules ] || npm ci --no-audit --no-fund
npx astro "${1:-build}"
