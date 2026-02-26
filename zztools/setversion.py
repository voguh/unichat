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

from confirm import confirm
from exec import exec
import logger
from pathlib import Path
from semver import Version
import sys

TOOLS_PATH = Path(__file__).resolve().parent
ROOT_PATH = TOOLS_PATH.parent

TAURI_APP_PATH = ROOT_PATH
TAURI_FRONTEND_PATH = TAURI_APP_PATH / "webapp"
CARGO_TOML_PATH = ROOT_PATH / "Cargo.toml"
CARGO_LOCK_PATH = ROOT_PATH / "Cargo.lock"

# ==================================================================================================================== #

def load_cargo_toml_version() -> Version | None:
    current_version = None

    with open(CARGO_TOML_PATH, "r", encoding="utf-8") as f:
        cargo_toml_content = f.read()
        is_inside_package = False
        for line in cargo_toml_content.splitlines():
            line = line.strip()
            if line == "[package]":
                is_inside_package = True
                continue
            if line.startswith("[") and line.endswith("]") and is_inside_package:
                break

            if is_inside_package and line.startswith("version = "):
                version_str = line.split("=", 1)[1]
                version_str = version_str.split("#")[0] if "#" in version_str else version_str
                version_str = version_str.strip().strip('"').strip("'")
                current_version = Version.parse(version_str)
                break

    return current_version

# ==================================================================================================================== #

def update_cargo_toml_version(current_version: Version, new_version: Version) -> None:
    new_cargo_toml_content = ""

    with open(CARGO_TOML_PATH, "r", encoding="utf-8") as f:
        cargo_toml_content = f.read()
        is_inside_package = False
        for line in cargo_toml_content.splitlines():
            line = line.strip()
            line_without_comments = line.split("#")[0].strip()

            if line_without_comments == "[package]":
                is_inside_package = True
            elif line_without_comments.startswith("[") and line_without_comments.endswith("]") and is_inside_package:
                is_inside_package = False

            if line_without_comments.startswith("version") and is_inside_package:
                line = line.replace(str(current_version), str(new_version))

            new_cargo_toml_content += line + "\n"

    with open(CARGO_TOML_PATH, "w", encoding="utf-8") as f:
        f.write(new_cargo_toml_content.strip() + "\n")

# ==================================================================================================================== #

def main():
    next_version_str = sys.argv[1]
    if next_version_str is None or next_version_str.strip() == "":
        logger.error("No version specified.")
        return

    next_version = Version.parse(next_version_str)

    # ============================================================================================ #

    logger.info("Loading '\033[33mCargo.toml\033[0m'...")
    logger.info("Checking '\033[33mCargo.toml\033[0m' current version...")
    current_version = load_cargo_toml_version()
    if current_version is None:
        logger.error("Could not find current version in '\033[33mCargo.toml\033[0m'.")
        return

    # ======================================================================== #

    logger.info("Updating '\033[33mCargo.toml\033[0m'...")
    logger.info("Current version in '\033[33mCargo.toml\033[0m' is '\033[33m{}\033[0m'.", current_version)
    update_cargo_toml_version(current_version, next_version)
    exec(["cargo", "update", "-p", "unichat"])
    logger.info("Updated '\033[33mCargo.toml\033[0m' to version '\033[33m{}\033[0m'.", next_version)

if __name__ == "__main__":
    main()
