# ******************************************************************************
#  Copyright (c) 2026 Voguh
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

import os
import sys

LOG_LEVELS = {
    "debug": [0, "\033[1;36mDEBUG\033[0m"],
    "info": [1, "\033[1;34mINFO\033[0m"],
    "warn": [2, "\033[1;33mWARNING\033[0m"],
    "error": [3, "\033[1;31mERROR\033[0m"]
}

def debug(message: str, *args) -> None:
    _dolog("debug", message, *args)

def info(message: str, *args) -> None:
    _dolog("info", message, *args)

def warn(message: str, *args) -> None:
    _dolog("warn", message, *args)

def error(message: str, *args) -> None:
    _dolog("error", message, *args)

def _dolog(level: str, message: str, *args) -> None:
    if level not in LOG_LEVELS:
        raise ValueError(f"Invalid log level: {level}")

    maximum_log_level = os.getenv("LOG_LEVEL", "info").lower()
    if maximum_log_level not in LOG_LEVELS:
        raise ValueError(f"Invalid maximum log level: {maximum_log_level}")

    if LOG_LEVELS[level][0] < LOG_LEVELS[maximum_log_level][0]:
        return

    label = LOG_LEVELS[level][1]
    formatted_message = message.format(*args)
    sys.stdout.write(f"\033[0m[{label}] {formatted_message}")
    if not formatted_message.endswith("\n"):
        sys.stdout.write("\n")
    sys.stdout.flush()

if __name__ == "__main__":
    print("This file is not meant to be run directly.")
