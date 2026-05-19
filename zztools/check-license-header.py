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
from enum import Enum
import fnmatch
import os
from pathlib import Path
import re
import sys
from utils import logger
from utils.constants import ROOT_PATH

# ============================================================================ #

EXCLUDE_PATHS = {
    ROOT_PATH / ".forgejo",
    ROOT_PATH / ".git",
    ROOT_PATH / ".vscode",
    ROOT_PATH / "(un)released-notes",
    ROOT_PATH / "capabilities",
    ROOT_PATH / "dist",
    ROOT_PATH / "gen",
    ROOT_PATH / "plugins",
    ROOT_PATH / "target",
    ROOT_PATH / "webapp" / "coverage",
    ROOT_PATH / "webapp" / "dist",
    ROOT_PATH / "webapp" / "node_modules",
    ROOT_PATH / "webapp" / "public" / "fontawesome",
    ROOT_PATH / "webapp" / ".eslintignore",
    ROOT_PATH / "webapp" / ".eslintrc.json",
    ROOT_PATH / "webapp" / ".npmrc",
    ROOT_PATH / "webapp" / ".nvmrc",
    ROOT_PATH / "webapp" / ".prettierrc.json",
    ROOT_PATH / "webapp" / "package.json",
    ROOT_PATH / "webapp" / "pnpm-lock.yaml",
    ROOT_PATH / "webapp" / "pnpm-workspace.yaml",
    ROOT_PATH / "webapp" / "tsconfig.json",
    ROOT_PATH / "widgets",
    ROOT_PATH / "zztools" / "utils" / "__pycache__",
    ROOT_PATH / ".editorconfig",
    ROOT_PATH / ".gitattributes",
    ROOT_PATH / ".gitignore",
    ROOT_PATH / ".taurignore",
    ROOT_PATH / "Cargo.lock",
    ROOT_PATH / "Cargo.toml",
    ROOT_PATH / "LICENSE",
    ROOT_PATH / "README.md",
    ROOT_PATH / "run.sh",
    ROOT_PATH / "rust-toolchain.toml",
    ROOT_PATH / "tauri.conf.json"
}

# ============================================================================ #

def is_text_file(path: Path) -> bool:
    try:
        path.read_text(encoding="utf-8")
        return True
    except UnicodeDecodeError:
        return False

# ============================================================================ #

class LicenseHeaderChecker(Enum):
    NO_ISSUES = 0
    MISSING_HEADER = 1
    MISSING_COPYRIGHT = 2
    WRONG_COPYRIGHT_YEAR = 3
    WRONG_COPYRIGHT_HOLDER = 4
    MISSING_EPL_TEXT = 5
    MISSING_SPDX = 6

def check_epl_header(path: Path) -> LicenseHeaderChecker:
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        if lines[0].startswith("#!/usr/bin") or lines[0].startswith("#!/bin"):
            lines = lines[1:]

        if len(lines) < 9:
            return LicenseHeaderChecker.MISSING_HEADER

        # Check second line if matches copyright pattern
        match_copyright = re.search(r"Copyright \(c\) (\d{4}(?:-\d{4})?) \w+", lines[1])
        if not match_copyright:
            return LicenseHeaderChecker.MISSING_COPYRIGHT
        else:
            match_year = re.search(r"\d{4}(?:-\d{4})?", match_copyright.group(0))
            copy_year = int(match_year.group(0).split("-")[-1])
            current_year = datetime.now(timezone.utc).year
            mtime_year = datetime.fromtimestamp(os.path.getmtime(path), timezone.utc).year
            if (copy_year < mtime_year) or (copy_year > current_year):
                return LicenseHeaderChecker.WRONG_COPYRIGHT_YEAR

        # Check fourth line if matches EPL text
        if not re.search(r"This program and the accompanying materials are made", lines[3]):
            return LicenseHeaderChecker.MISSING_EPL_TEXT

        # Check fifth line if matches EPL text
        if not re.search(r"available under the terms of the Eclipse Public License 2\.0", lines[4]):
            return LicenseHeaderChecker.MISSING_EPL_TEXT

        # Check sixth line if matches SPDX pattern
        if not re.search(r"which is available at https://www\.eclipse\.org/legal/epl-2\.0/", lines[5]):
            return LicenseHeaderChecker.MISSING_EPL_TEXT

        # Check eighth line if matches SPDX pattern
        if not re.search(r"SPDX-License-Identifier: EPL-2\.0", lines[7]):
            return LicenseHeaderChecker.MISSING_SPDX

        return LicenseHeaderChecker.NO_ISSUES
    except OSError:
        return None

def main():
    logger.info("Checking license headers...")

    missing = []
    for file in sorted(ROOT_PATH.rglob("*")):
        if not file.is_file():
            continue
        if any(file.is_relative_to(d) for d in EXCLUDE_PATHS):
            continue
        if not is_text_file(file):
            continue

        logger.debug(f"Checking {file}...")
        header_status = check_epl_header(file)
        if header_status == None:
            missing.append(["UNREADABLE", file])
        elif header_status != LicenseHeaderChecker.NO_ISSUES:
            missing.append([header_status.name, file])

    if not missing:
        logger.info("License header check completed.")
        sys.exit(0)

    logger.warn(f"Found {len(missing)} file(s) with license header issues:")
    for [issue, path] in missing:
        logger.warn(f" - [{issue}] ./{path.relative_to(ROOT_PATH)}")
    sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
