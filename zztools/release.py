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

import argparse
from pathlib import Path
import shutil
from utils import logger
from utils.exec import exec
from utils.confirm import confirm
from utils.constants import check_requirements, TOOLS_PATH, ROOT_PATH, TAURI_APP_PATH, TAURI_FRONTEND_PATH
from utils.semver import Version

CARGO_TOML_PATH = ROOT_PATH / "Cargo.toml"
CARGO_LOCK_PATH = ROOT_PATH / "Cargo.lock"

# ==================================================================================================================== #

def main():
    parser = argparse.ArgumentParser(description="Release management tool")
    parser.add_argument("version", type=str, help="Version to release")
    parser.add_argument("--prerelease", "-p", action="store_true", help="Indicates if the release is a pre-release version")

    args = parser.parse_args()
    next_version = Version.parse(args.version)

    if not confirm(f"Are you sure you want to release version '{next_version}'?"):
        logger.error("Release cancelled by user.")
        return

    if next_version.pre_release != None and not args.prerelease:
        logger.error("Version '{}' is a pre-release version. Use the '--prerelease' flag to confirm.", next_version)
        return

    if next_version.pre_release == None and args.prerelease:
        logger.error("Version '{}' is not a pre-release version. Remove the '--prerelease' flag to confirm.", next_version)
        return

    # ============================================================================================ #

    logger.info("Checking working directory status...")
    git_status = exec(["git", "status", "--porcelain"]).stdout.strip()
    if git_status:
        logger.error("Working directory is not clean. Please commit or stash your changes before releasing.")
        return

    # ============================================================================================ #

    logger.info("Checking current git branch...")
    current_branch = exec(["git", "rev-parse", "--abbrev-ref", "HEAD"]).stdout.strip()
    if next_version.patch != 0:
        expected_branch = f"stable/{next_version.major}.{next_version.minor}.x"

        if current_branch != expected_branch:
            logger.error("You must be on branch '\033[33m{}\033[0m' to release patch versions but current branch is '\033[33m{}\033[0m'.", expected_branch, current_branch)
            return
    else:
        expected_branch = "main"

        if current_branch != expected_branch:
            logger.error("You must be on branch '\033[33m{}\033[0m' to release major/minor versions but current branch is '\033[33m{}\033[0m'.", expected_branch, current_branch)
            return
    logger.info("Current git branch is '\033[33m{}\033[0m'.", current_branch)

    logger.info("Checking version tag uniqueness...")
    existing_tags = exec(["git", "tag"]).stdout.strip().splitlines()
    if str(next_version) in existing_tags:
        logger.error("Version tag '\033[33m{}\033[0m' already exists. Please choose a different version.", next_version)
        return
    logger.info("Version tag '\033[33m{}\033[0m' is unique.", next_version)

    # ============================================================================================ #

    logger.info("Updating version in '\033[33mCargo.toml\033[0m'...")
    exec([TOOLS_PATH / "setversion.py", str(next_version)])

    # ============================================================================================ #

    logger.info("Cleaning up previous build artifacts...")
    shutil.rmtree(TAURI_FRONTEND_PATH / "node_modules", ignore_errors=True)
    shutil.rmtree(TAURI_FRONTEND_PATH / "dist", ignore_errors=True)
    shutil.rmtree(TAURI_APP_PATH / "target", ignore_errors=True)

    # ============================================================================================ #

    logger.info("Running tests and building project...")
    exec(["pnpm", "install", "--frozen-lockfile"], cwd=TAURI_FRONTEND_PATH)
    exec(["cargo", "tauri", "build"])

    # ============================================================================================ #

    logger.info("Committing changes...")
    exec(["git", "add", CARGO_TOML_PATH.as_posix(), CARGO_LOCK_PATH.as_posix()])
    exec(["git", "commit", "--allow-empty", "-m", f"chore: release version {next_version}"])
    exec(["git", "tag", "-a", f"{next_version}", "-m", f"{next_version}"])
    exec(["git", "push", "origin", current_branch, "--tags"])

if __name__ == "__main__":
    try:
        check_requirements()
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
