#!/bin/bash
set -euo pipefail

ROOT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

export TAURI_APP_PATH="$ROOT_PATH"
export TAURI_FRONTEND_PATH="$ROOT_PATH/webapp"

pnpm --prefix "$TAURI_FRONTEND_PATH" install --frozen-lockfile;
cargo tauri dev;
