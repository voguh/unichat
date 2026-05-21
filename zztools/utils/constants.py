# ******************************************************************************
#  Copyright (c) 2026 Voguh
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

from pathlib import Path

EXPECTED_RUSTC_VERSION = "1.95.0"
EXPECTED_NODE_VERSION = "24.16.0"
EXPECTED_PNPM_VERSION = "10.33.4"

TOOLS_PATH = Path(__file__).resolve().parent.parent
ROOT_PATH = TOOLS_PATH.parent

DIST_PATH = ROOT_PATH / "dist"
TAURI_APP_PATH = ROOT_PATH
TAURI_FRONTEND_PATH = ROOT_PATH / "webapp"

def check_requirements():
    from os import environ
    from subprocess import run
    from .logger import info

    env = environ.copy()
    env["TAURI_APP_PATH"] = str(TAURI_APP_PATH)
    env["TAURI_FRONTEND_PATH"] = str(TAURI_FRONTEND_PATH)

    info(f"Checking Rust compiler version (expected: \033[0;36m{EXPECTED_RUSTC_VERSION}\033[0m)...")
    rustc_version_output = run(r"rustc --version 2>&1 | awk '{print $2}'", cwd=TAURI_APP_PATH, env=env, shell=True, capture_output=True, text=True).stdout.strip()
    if rustc_version_output != EXPECTED_RUSTC_VERSION:
        raise EnvironmentError(f"Expected Rust compiler version {EXPECTED_RUSTC_VERSION}, but found {rustc_version_output}.")
    info("Rust compiler version is correct.")

    info(f"Checking Node.js version (expected: \033[0;36m{EXPECTED_NODE_VERSION}\033[0m)...")
    node_version_output = run(r"node --version 2>&1 | grep -oP '(?<=v)[^\\s]+'", cwd=TAURI_FRONTEND_PATH, env=env, shell=True, capture_output=True, text=True).stdout.strip()
    if node_version_output != EXPECTED_NODE_VERSION:
        raise EnvironmentError(f"Expected Node.js version {EXPECTED_NODE_VERSION}, but found {node_version_output}.")
    info("Node.js version is correct.")

    info(f"Checking pnpm version (expected: \033[0;36m{EXPECTED_PNPM_VERSION}\033[0m)...")
    pnpm_version_output = run(r"pnpm --version", cwd=TAURI_FRONTEND_PATH, env=env, shell=True, capture_output=True, text=True).stdout.strip()
    if pnpm_version_output != EXPECTED_PNPM_VERSION:
        raise EnvironmentError(f"Expected pnpm version {EXPECTED_PNPM_VERSION}, but found {pnpm_version_output}.")
    info("pnpm version is correct.")

if __name__ == "__main__":
    print("This file is not meant to be run directly.")
