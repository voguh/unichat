#!/bin/bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script is intended to be sourced, not executed directly.";
  exit 1;
fi

logger_log() {
    local level="${1^^}";
    shift
    local message="$*";
    local timestamp;
    timestamp="$(date +"%Y-%m-%dT%H:%M:%S%z")";
    local color_reset="\033[0m";

    if [[ "$level" != "INFO" && "$level" != "WARN" && "$level" != "ERROR" ]]; then
        level="INFO";
    fi

    if [[ "$level" == "INFO" ]]; then
        local color="\033[0;32m"    # Green
        echo -e "[${timestamp}] ${color}[${level}]${color_reset} ${message}"
    elif [[ "$level" == "WARN" ]]; then
        local color="\033[0;33m" # Yellow
        echo -e "[${timestamp}] ${color}[${level}]${color_reset} ${message}"
    elif [[ "$level" == "ERROR" ]]; then
        local color="\033[0;31m"   # Red
        echo -e "[${timestamp}] ${color}[${level}]${color_reset} ${message}"
    else
        echo "[${timestamp}] [UNKNOWN] ${message}"
    fi
}

logger_info() {
    logger_log "INFO" "$@"
}

logger_warn() {
    logger_log "WARN" "$@"
}

logger_error() {
    logger_log "ERROR" "$@"
}
