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
from pathlib import Path
import subprocess

TOOLS_PATH = Path(__file__).resolve().parent
ROOT_PATH = TOOLS_PATH.parent

TAURI_APP_PATH = ROOT_PATH
TAURI_FRONTEND_PATH = TAURI_APP_PATH / "webapp"

def exec(command, **kwargs) -> subprocess.CompletedProcess:
    env = os.environ.copy()
    env["TAURI_APP_PATH"] = TAURI_APP_PATH.as_posix()
    env["TAURI_FRONTEND_PATH"] = TAURI_FRONTEND_PATH.as_posix()
    defaults = { "env": env, "cwd": ROOT_PATH, "check": True }

    return subprocess.run(command, **{**defaults, **kwargs})
