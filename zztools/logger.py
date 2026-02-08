# ******************************************************************************
#  UniChat
#  Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

import os

def debug(message: str, *args) -> None:
    _do_log("DEBUG", message, *args)

def info(message: str, *args) -> None:
    _do_log("INFO", message, *args)

def warning(message: str, *args) -> None:
    _do_log("WARNING", message, *args)

def error(message: str, *args) -> None:
    _do_log("ERROR", message, *args)

def _do_log(level: str, message: str, *args) -> None:
    log_level = os.getenv("LOG_LEVEL", "DEBUG").upper()

    levels = ["DEBUG", "INFO", "WARNING", "ERROR"]
    level_colors = ["\033[0;34m", "\033[0;32m", "\033[0;33m", "\033[0;31m"]

    if levels.index(level) < levels.index(log_level):
        return

    color = level_colors[levels.index(level)]
    formatted_message = message.format(*args)
    print(f"[{color}{level}\033[0m] {formatted_message}")
