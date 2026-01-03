#!/bin/bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script is intended to be sourced, not executed directly.";
  exit 1;
fi

if [[ -n "${ROOT_PATH:-}" ]]; then
  return 0 2>/dev/null || exit 0;
fi

TOOLS_PATH="$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")";
ROOT_PATH="$(dirname "$TOOLS_PATH")";
source "$TOOLS_PATH/utils/logger.sh";
source "$TOOLS_PATH/utils/semver.sh";

export TAURI_APP_PATH="$ROOT_PATH"
export TAURI_FRONTEND_PATH="$ROOT_PATH/webapp"

confirm() {
    logger_info "$1 ([Y]es/[N]o)";
    read -r response;
    local first="${response,}";
    if [[ "$first" != "y" ]]; then
        return 1;
    fi

    return 0;
}

pnpm() {
    (cd "$TAURI_FRONTEND_PATH" && command pnpm "$@");
}
