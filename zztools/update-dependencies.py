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

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import json
import re
import subprocess
import urllib.request
from utils import logger
from utils.exec import exec
from utils.constants import ROOT_PATH, TAURI_FRONTEND_PATH
from utils.semver import Version

CARGO_TOML_PATH = ROOT_PATH / "Cargo.toml"
PACKAGE_JSON_PATH = TAURI_FRONTEND_PATH / "package.json"
PNPM_WORKSPACE_PATH = TAURI_FRONTEND_PATH / "pnpm-workspace.yaml"
TAURI_CONF_PATH = ROOT_PATH / "tauri.conf.json"

CARGO_DEP_LINE = re.compile(r'^\s*([A-Za-z0-9_-]+)\s*=\s*(?:"=([^"]+)"|\{.*?\bversion\s*=\s*"=([^"]+)")')
CARGO_UPDATING_LINE = re.compile(r'Updating (\S+) v(\S+) -> v(\S+)')

# ==================================================================================================================== #

def load_quarantine() -> timedelta:
    with open(PNPM_WORKSPACE_PATH, "r", encoding="utf-8") as f:
        for line in f.read().splitlines():
            line = line.split("#")[0].strip()
            if line.startswith("minimumReleaseAge:"):
                return timedelta(minutes=int(line.split(":", 1)[1].strip()))

    return timedelta(0)

def is_caret_compatible(current: Version, candidate: Version) -> bool:
    if current.major != 0:
        return candidate.major == current.major

    return candidate.major == 0 and candidate.minor == current.minor

def is_published_before(created_at: str, deadline: datetime) -> bool:
    return datetime.fromisoformat(created_at.replace("Z", "+00:00")) <= deadline

def tauri_npm_counterpart(crate: str) -> str | None:
    if crate == "tauri":
        return "@tauri-apps/api"

    if crate.startswith("tauri-plugin-"):
        return "@tauri-apps/plugin-" + crate.removeprefix("tauri-plugin-")

    return None

# ==================================================================================================================== #

def load_cargo_dependencies() -> dict[str, Version]:
    dependencies: dict[str, Version] = {}

    with open(CARGO_TOML_PATH, "r", encoding="utf-8") as f:
        is_inside_dependencies = False
        for line in f.read().splitlines():
            line = line.split("#")[0].strip()
            if line.startswith("[") and line.endswith("]"):
                is_inside_dependencies = line[1:-1].strip().endswith("dependencies")
                continue

            if not is_inside_dependencies:
                continue

            match = CARGO_DEP_LINE.match(line)
            if match is not None:
                dependencies[match.group(1)] = Version.parse(match.group(2) or match.group(3))

    return dependencies

def fetch_npm_minors(name: str, quarantine: timedelta) -> set[tuple[int, int]]:
    request = urllib.request.Request(f"https://registry.npmjs.org/{name.replace('/', '%2f')}", headers={ "Accept": "application/json" })
    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)

    deadline = datetime.now(timezone.utc) - quarantine
    minors: set[tuple[int, int]] = set()
    for num in data["versions"]:
        if "-" in num or not is_published_before(data["time"][num], deadline):
            continue

        parsed = Version.parse(num)
        minors.add((parsed.major, parsed.minor))

    return minors

def crate_index_path(name: str) -> str:
    name = name.lower()
    if len(name) <= 2:
        return f"{len(name)}/{name}"

    if len(name) == 3:
        return f"3/{name[0]}/{name}"

    return f"{name[0:2]}/{name[2:4]}/{name}"

def fetch_crate_candidate(name: str, current: Version, quarantine: timedelta, allowed_minors: set[tuple[int, int]] | None = None, max_version: Version | None = None) -> Version | None:
    # The crates.io API is limited to 1 req/s; the sparse index is served by a CDN and carries pubtime.
    with urllib.request.urlopen(f"https://index.crates.io/{crate_index_path(name)}", timeout=30) as response:
        versions = [json.loads(line) for line in response.read().decode("utf-8").splitlines() if line.strip()]

    deadline = datetime.now(timezone.utc) - quarantine
    candidate = None
    for version in versions:
        if version["yanked"] or "-" in version["vers"] or "pubtime" not in version:
            continue

        if not is_published_before(version["pubtime"], deadline):
            continue

        parsed = Version.parse(version["vers"])
        if allowed_minors is not None and (parsed.major, parsed.minor) not in allowed_minors:
            continue

        if max_version is not None and parsed > max_version:
            continue

        if parsed > current and is_caret_compatible(current, parsed) and (candidate is None or parsed > candidate):
            candidate = parsed

    return candidate

def update_cargo_toml(updates: dict[str, tuple[Version, Version]]) -> None:
    new_content = ""

    with open(CARGO_TOML_PATH, "r", encoding="utf-8") as f:
        is_inside_dependencies = False
        for line in f.read().splitlines():
            line_without_comments = line.split("#")[0].strip()
            if line_without_comments.startswith("[") and line_without_comments.endswith("]"):
                is_inside_dependencies = line_without_comments[1:-1].strip().endswith("dependencies")
            elif is_inside_dependencies:
                match = CARGO_DEP_LINE.match(line_without_comments)
                if match is not None and match.group(1) in updates:
                    current, next = updates[match.group(1)]
                    line = line.replace(f'"={current}"', f'"={next}"', 1)

            new_content += line + "\n"

    with open(CARGO_TOML_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

def update_cargo(quarantine: timedelta, npm_dependencies: dict[str, str]) -> dict[str, Version]:
    logger.info("Checking '\033[33mCargo.toml\033[0m' dependencies...")
    dependencies = load_cargo_dependencies()

    def fetch_candidate(name: str, current: Version) -> Version | None:
        counterpart = tauri_npm_counterpart(name)
        allowed_minors = fetch_npm_minors(counterpart, quarantine) if counterpart in npm_dependencies else None
        return fetch_crate_candidate(name, current, quarantine, allowed_minors)

    with ThreadPoolExecutor(max_workers=8) as executor:
        candidates = list(executor.map(fetch_candidate, dependencies.keys(), dependencies.values()))

    updates: dict[str, tuple[Version, Version]] = {}
    for (name, current), candidate in zip(dependencies.items(), candidates):
        if candidate is None:
            continue

        logger.info("Updating '\033[33m{}\033[0m' from '\033[33m{}\033[0m' to '\033[33m{}\033[0m'.", name, current, candidate)
        updates[name] = (current, candidate)

    if len(updates) == 0:
        logger.info("No crates to update.")
        return dependencies

    update_cargo_toml(updates)
    exec(["cargo", "update", "--workspace"])
    logger.info("Updated {} crate(s) in '\033[33mCargo.toml\033[0m'.", len(updates))

    return { **dependencies, **{ name: next for name, (_, next) in updates.items() } }

def update_cargo_transitive(quarantine: timedelta) -> None:
    logger.info("Checking '\033[33mCargo.lock\033[0m' transitive dependencies...")
    result = exec(["cargo", "update", "--dry-run", "--color", "never"])

    pending: list[tuple[str, Version, Version]] = []
    for name, current, target in CARGO_UPDATING_LINE.findall(result.stdout + "\n" + result.stderr):
        if "-" not in current and "-" not in target:
            pending.append((name, Version.parse(current), Version.parse(target)))

    with ThreadPoolExecutor(max_workers=8) as executor:
        candidates = list(executor.map(lambda item: fetch_crate_candidate(item[0], item[1], quarantine, max_version=item[2]), pending))

    for (name, current, _), candidate in zip(pending, candidates):
        if candidate is None:
            continue

        result = exec(["cargo", "update", "-p", f"{name}@{current}", "--precise", str(candidate)], check=False)
        if result.returncode != 0:
            logger.warn("Could not update '\033[33m{}\033[0m' to '\033[33m{}\033[0m'.", name, candidate)

def update_tauri_schema(tauri_version: Version) -> None:
    with open(TAURI_CONF_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = re.sub(r'"https://schema\.tauri\.app/config/[^"]+"', f'"https://schema.tauri.app/config/{tauri_version}"', content, count=1)
    if new_content == content:
        return

    with open(TAURI_CONF_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    logger.info("Updated '\033[33mtauri.conf.json\033[0m' schema to version '\033[33m{}\033[0m'.", tauri_version)

# ==================================================================================================================== #

def load_npm_dependencies() -> dict[str, str]:
    with open(PACKAGE_JSON_PATH, "r", encoding="utf-8") as f:
        package_json = json.load(f)

    return { **package_json.get("dependencies", {}), **package_json.get("devDependencies", {}) }

def update_pnpm(npm_dependencies: dict[str, str], cargo_versions: dict[str, Version]) -> None:
    logger.info("Updating '\033[33mpackage.json\033[0m' dependencies...")
    tauri_versions = { tauri_npm_counterpart(name): version for name, version in cargo_versions.items() }

    selectors = []
    for name, version in npm_dependencies.items():
        if name in tauri_versions:
            selectors.append(f"{name}@~{tauri_versions[name].major}.{tauri_versions[name].minor}.0")
        else:
            selectors.append(f"{name}@^{version.lstrip('^~=')}")

    subprocess.run(["pnpm", "update"], cwd=TAURI_FRONTEND_PATH, check=True)
    subprocess.run(["pnpm", "update", *selectors], cwd=TAURI_FRONTEND_PATH, check=True)

# ==================================================================================================================== #

def main():
    quarantine = load_quarantine()
    npm_dependencies = load_npm_dependencies()
    cargo_versions = update_cargo(quarantine, npm_dependencies)
    update_cargo_transitive(quarantine)
    update_tauri_schema(cargo_versions["tauri"])
    update_pnpm(npm_dependencies, cargo_versions)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
