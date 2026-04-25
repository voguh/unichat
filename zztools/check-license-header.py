#!/usr/bin/env python3
# ******************************************************************************
#  Copyright (c) 2026 Voguh
#
#  This program and the accompanying materials are made
#  available under the terms of the Eclipse Public License 2.0
#  which is available at https://www.eclipse.org/legal/epl-2.0/
#
#  SPDX-License-Identifier: EPL-2.0
# ******************************************************************************

from datetime import datetime, timezone
import fnmatch
import logger
import os
from pathlib import Path
import re

TOOLS_PATH = Path(__file__).resolve().parent
ROOT_PATH = TOOLS_PATH.parent

# ============================================================================ #

def is_text_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            chunk = f.read(1024)
            if b'\0' in chunk:
                return False
        return True
    except Exception:
        return False

def check_copyright_year(file_path):
    try:
        last_modified_year = datetime.fromtimestamp(os.path.getmtime(file_path), tz=timezone.utc).year

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

            if "Copyright (c)" in content:
                years = []
                for match in re.findall(r"\b(\d{4})(?:\s*-\s*(\d{4}))?\b", content):
                    start_year = int(match[0])
                    end_year = int(match[1]) if match[1] else start_year
                    years.append((start_year, end_year))

                if years:
                    if not any(start_year <= last_modified_year <= end_year for start_year, end_year in years):
                        logger.warning(f"Incorrect or missing copyright year in: {file_path}")
    except Exception as e:
        logger.error(f"Error checking copyright year in file {file_path}: {e}")

def main():
    logger.info("Checking license headers...")
    ignore_dirs = [
        ".forgejo",
        ".git",
        ".vscode",
        "capabilities",
        "coverage",
        "dist",
        "gen",
        "node_modules",
        "plugins",
        "target",
        "widgets",
        "zztools"
    ]
    ignore_files = [
        ".editorconfig",
        ".eslintignore",
        ".eslintrc*",
        ".gitattributes",
        ".gitignore",
        ".npmrc",
        ".nvmrc",
        ".prettierrc*",
        ".taurignore",
        "Cargo.lock",
        "Cargo.toml",
        "LICENSE",
        "package.json",
        "pnpm-lock.yaml",
        "pnpm-workspace.yaml",
        "README.md",
        "run.sh",
        "rust-toolchain.toml",
        "tauri.conf.json",
        "tsconfig.json"
    ]

    for root, dirs, files in os.walk(ROOT_PATH):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            if any(fnmatch.fnmatch(file, pattern) for pattern in ignore_files):
                continue

            file_path = os.path.join(root, file)
            try:
                if not is_text_file(file_path):
                    continue

                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "Eclipse Public License 2.0" not in content:
                        logger.warning(f"Missing license header: {file_path}")

                check_copyright_year(file_path)
            except Exception as e:
                logger.error(f"Error reading file {file_path}: {e}")

    logger.info("License header check completed.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
