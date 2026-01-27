#!/usr/bin/env python3
# ******************************************************************************
#  UniChat
#  Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
#
#  This Source Code Form is subject to the terms of the Mozilla Public
#  License, v. 2.0. If a copy of the MPL was not distributed with this
#  file, You can obtain one at https://mozilla.org/MPL/2.0/.
# ******************************************************************************

import argparse
from confirm import confirm
import logger
import os
from pathlib import Path
from semver import Version
import shutil
import subprocess

TOOLS_PATH = Path(__file__).resolve().parent
ROOT_PATH = TOOLS_PATH.parent

TAURI_APP_PATH = ROOT_PATH
TAURI_FRONTEND_PATH = TAURI_APP_PATH / "webapp"
CARGO_TOML_PATH = ROOT_PATH / "Cargo.toml"
CARGO_LOCK_PATH = ROOT_PATH / "Cargo.lock"

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

# ================================================================================================ #

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

# ================================================================================================ #

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

    logger.info("Checking current git branch...")
    current_branch = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
    if next_version.patch != 0:
        expected_branch = f"stable/{next_version.major}.{next_version.minor}.x"

        if current_branch != expected_branch:
            logger.error("You must be on branch '{}' to release patch versions. Current branch is '{}'.", expected_branch, current_branch)
            return
    else:
        expected_branch = "main"

        if current_branch != expected_branch:
            logger.error("You must be on branch '{}' to release major/minor versions. Current branch is '{}'.", expected_branch, current_branch)
            return
    logger.info("Current git branch is '\033[33m{}\033[0m'.", current_branch)

    logger.info("Checking version tag uniqueness...")
    existing_tags = subprocess.run(["git", "tag"], capture_output=True, text=True, check=True).stdout.strip().splitlines()
    if str(next_version) in existing_tags:
        logger.error("Version tag '{}' already exists. Please choose a different version.", next_version)
        return
    logger.info("Version tag '\033[33m{}\033[0m' is unique.", next_version)

    # ============================================================================================ #

    logger.info("Loading '\033[33mCargo.toml\033[0m'...")
    logger.info("Checking '\033[33mCargo.toml\033[0m' current version...")
    current_version = load_cargo_toml_version()

    if current_version is None:
        logger.error("Could not find current version in '\033[33mCargo.toml\033[0m'.")
        return

    logger.info("Current version is '\033[33m{}\033[0m'.", current_version)
    if next_version <= current_version:
        logger.error("New version '{}' must be greater than current version '{}'!", next_version, current_version)
        return

    # ============================================================================================ #

    logger.info("Updating '\033[33mCargo.toml\033[0m'...")
    update_cargo_toml_version(current_version, next_version)
    subprocess.run(["cargo", "update", "-p", "unichat"], cwd=TAURI_APP_PATH, check=True)
    logger.info("Updated '\033[33mCargo.toml\033[0m' to version '\033[33m{}\033[0m'.", next_version)

    # ============================================================================================ #

    logger.info("Cleaning up previous build artifacts...")
    shutil.rmtree(TAURI_FRONTEND_PATH / "node_modules", ignore_errors=True)
    shutil.rmtree(TAURI_FRONTEND_PATH / "dist", ignore_errors=True)
    shutil.rmtree(TAURI_APP_PATH / "target", ignore_errors=True)

    # ============================================================================================ #

    logger.info("Running tests and building project...")
    env = os.environ.copy()
    env["TAURI_APP_PATH"] = TAURI_APP_PATH.as_posix()
    env["TAURI_FRONTEND_PATH"] = TAURI_FRONTEND_PATH.as_posix()

    subprocess.run(["pnpm", "install", "--frozen-lockfile"], env=env, cwd=TAURI_FRONTEND_PATH, check=True)
    subprocess.run(["pnpm", "test", "run", "--passWithNoTests"], env=env, cwd=TAURI_FRONTEND_PATH, check=True)
    subprocess.run(["pnpm", "build:ui"], env=env, cwd=TAURI_FRONTEND_PATH, check=True)
    subprocess.run(["cargo", "test", "--all-targets", "--all-features"], env=env, cwd=TAURI_APP_PATH, check=True)
    subprocess.run(["cargo", "tauri", "build"], env=env, cwd=TAURI_APP_PATH, check=True)

    # ============================================================================================ #

    logger.info("Committing changes...")
    subprocess.run(["git", "add", CARGO_TOML_PATH.as_posix(), CARGO_LOCK_PATH.as_posix()], env=env, check=True)
    subprocess.run(["git", "commit", "-m", f"chore: release version {next_version}"], env=env, check=True)
    subprocess.run(["git", "tag", "-a", f"{next_version}", "-m", f"{next_version}"], env=env, check=True)
    subprocess.run(["git", "push", "origin", current_branch, "--tags"], env=env, check=True)

    if next_version.pre_release == None:
        if next_version.patch == 0:
            stable_branch = f"stable/{next_version.major}.{next_version.minor}.x"
            subprocess.run(["git", "checkout", "-B", stable_branch], env=env, check=True)
            subprocess.run(["git", "push", "-u", "origin", stable_branch], env=env, check=True)
            subprocess.run(["git", "checkout", current_branch], env=env, check=True)

if __name__ == "__main__":
    main()
