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

import json
import shutil
import sys
import tomllib
from utils import logger
from utils.constants import DIST_PATH, ROOT_PATH
from utils.exec import exec

# ============================================================================ #

CARGO_TOML_PATH = ROOT_PATH / "Cargo.toml"
NPM_PACKAGE_SOURCE_PATH = ROOT_PATH / "unichat-api"
NPM_PACKAGE_PATH = ROOT_PATH / "target" / "unichat-api"

# ============================================================================ #

def main():
    with open(CARGO_TOML_PATH, "rb") as f:
        cargo_package = tomllib.load(f)["package"]

    version = sys.argv[1] if len(sys.argv) > 1 else cargo_package["version"]

    logger.info("Copying '\033[33m{}\033[0m'...", NPM_PACKAGE_SOURCE_PATH.relative_to(ROOT_PATH))
    if NPM_PACKAGE_PATH.exists():
        shutil.rmtree(NPM_PACKAGE_PATH)
    shutil.copytree(NPM_PACKAGE_SOURCE_PATH, NPM_PACKAGE_PATH)

    logger.info("Populating '\033[33mpackage.json\033[0m' with version '\033[33m{}\033[0m'...", version)
    package_json_path = NPM_PACKAGE_PATH / "package.json"
    package_json = json.loads(package_json_path.read_text(encoding="utf-8"))
    package_json["version"] = version
    package_json["license"] = cargo_package["license"]
    package_json["author"] = cargo_package["authors"][0]
    package_json["homepage"] = cargo_package["homepage"]
    package_json["repository"]["url"] = cargo_package["homepage"]
    package_json_path.write_text(json.dumps(package_json, indent=4) + "\n", encoding="utf-8")

    logger.info("Packing...")
    DIST_PATH.mkdir(parents=True, exist_ok=True)
    exec(["npm", "pack", str(NPM_PACKAGE_PATH), "--pack-destination", str(DIST_PATH)])
    (DIST_PATH / f"voguh-unichat-api-{version}.tgz").replace(DIST_PATH / f"unichat-api-{version}.tgz")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
