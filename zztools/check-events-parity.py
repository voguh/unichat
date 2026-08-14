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

from pathlib import Path
import re
import sys
from utils import logger
from utils.constants import ROOT_PATH

# ============================================================================ #

RUST_PATH = ROOT_PATH / "src" / "events" / "unichat.rs"
TYPESCRIPT_PATH = ROOT_PATH / "widgets" / "unichat.d.ts"
LUA_PATH = ROOT_PATH / "plugins" / ".types" / "UniChatAPI.lua"

STATUS_RUST_PATH = ROOT_PATH / "src" / "scraper" / "status.rs"
STATUS_TYPESCRIPT_PATH = ROOT_PATH / "webapp" / "src" / "utils" / "IPCStatusEvent.ts"

STATUS_RUST_ONLY_FIELDS = ("status", "extra")

PAYLOADS = [
    ("UniChatClearEventPayload", "UniChatEventClear", "UniChatClearEventPayload"),
    ("UniChatRemoveMessageEventPayload", "UniChatEventRemoveMessage", "UniChatRemoveMessageEventPayload"),
    ("UniChatRemoveAuthorEventPayload", "UniChatEventRemoveAuthor", "UniChatRemoveAuthorEventPayload"),
    ("UniChatMessageEventPayload", "UniChatEventMessage", "UniChatMessageEventPayload"),
    ("UniChatDonateEventPayload", "UniChatEventDonate", "UniChatDonateEventPayload"),
    ("UniChatSponsorEventPayload", "UniChatEventSponsor", "UniChatSponsorEventPayload"),
    ("UniChatSponsorGiftEventPayload", "UniChatEventSponsorGift", "UniChatSponsorGiftEventPayload"),
    ("UniChatRaidEventPayload", "UniChatEventRaid", "UniChatRaidEventPayload"),
    ("UniChatRedemptionEventPayload", "UniChatEventRedemption", "UniChatRedemptionEventPayload"),
    ("UniChatGiftEventPayload", "UniChatEventGift", "UniChatGiftEventPayload"),
    ("UniChatUserstoreUpdateEventPayload", "UniChatEventUserstoreUpdate", "UniChatUserstoreUpdateEventPayload")
]

VARIANTS_WITHOUT_FACTORY = {"UserstoreUpdate"}

# ============================================================================ #

def to_camel_case(snake_case: str) -> str:
    head, *tail = snake_case.split("_")
    return head + "".join(part.capitalize() for part in tail)

def block(source: str, path: Path, header: str, closer: str) -> str:
    match = re.search(re.escape(header) + r"(.*?)" + re.escape(closer), source, re.DOTALL)
    if not match:
        raise LookupError(f"'{header.strip()}' not found in ./{path.relative_to(ROOT_PATH)}")

    return match.group(1)

# ============================================================================ #

def parse_rust(source: str, struct_name: str, path: Path = RUST_PATH) -> dict[str, bool]:
    fields = {}
    for line in block(source, path, f"pub struct {struct_name} {{\n", "\n}").splitlines():
        line = line.strip()
        if not line.startswith("pub "):
            continue

        name, _, kind = line[4:].rstrip(",").partition(": ")
        if kind:
            fields[to_camel_case(name)] = kind.startswith("Option<")

    return fields

def parse_typescript(source: str, interface_name: str, path: Path = TYPESCRIPT_PATH) -> dict[str, bool]:
    fields = {}
    for line in block(source, path, f"export interface {interface_name} {{\n", "\n}").splitlines():
        line = line.strip()
        if line.startswith(("/*", "*", "//")):
            continue

        name, _, kind = line.rstrip(";").partition(": ")
        if not kind or name in ("type", "data"):
            continue

        fields[name] = kind.endswith("| null")

    return fields

def parse_lua(source: str, class_name: str) -> dict[str, bool]:
    fields = {}
    for line in block(source, LUA_PATH, f"---@class {class_name}\n", "\n\n").splitlines():
        if not line.startswith("---@field "):
            continue

        name = line[10:].split(" ", 1)[0]
        fields[name.rstrip("?")] = name.endswith("?")

    return fields

# ============================================================================ #

def compare(payload: str, left_name: str, left: dict[str, bool], right_name: str, right: dict[str, bool]) -> list[str]:
    problems = []

    for field, optional in left.items():
        if field not in right:
            problems.append(f"{payload}.{field}: present in {left_name} but missing in {right_name}")
        elif right[field] != optional:
            problems.append(f"{payload}.{field}: optional={optional} in {left_name} but optional={right[field]} in {right_name}")

    for field in right:
        if field not in left:
            problems.append(f"{payload}.{field}: present in {right_name} but missing in {left_name}")

    return problems

def missing_factories(rust_source: str, lua_source: str) -> list[str]:
    factories = block(lua_source, LUA_PATH, "---@class UniChatEventFactory\n", "\n\n")

    missing = []
    for line in block(rust_source, RUST_PATH, "pub enum UniChatEvent {\n", "\n}").splitlines():
        variant = line.strip().rstrip(",").split("(")[0]
        if not variant or variant.startswith("#") or variant in VARIANTS_WITHOUT_FACTORY:
            continue

        if f"---@field {variant} fun" not in factories:
            missing.append(variant)

    return missing

# ============================================================================ #

def main():
    logger.info("Checking event contract parity...")

    for path in (RUST_PATH, TYPESCRIPT_PATH, LUA_PATH, STATUS_RUST_PATH, STATUS_TYPESCRIPT_PATH):
        if not path.is_file():
            logger.error(f"Contract file is missing: ./{path.relative_to(ROOT_PATH)}")
            sys.exit(1)

    rust_source = RUST_PATH.read_text(encoding="utf-8")
    typescript_source = TYPESCRIPT_PATH.read_text(encoding="utf-8")
    lua_source = LUA_PATH.read_text(encoding="utf-8")

    problems = []
    for rust_name, typescript_name, lua_name in PAYLOADS:
        logger.debug(f"Checking {rust_name}...")

        rust = parse_rust(rust_source, rust_name)
        problems += compare(rust_name, "rust", rust, "typescript", parse_typescript(typescript_source, typescript_name))
        problems += compare(rust_name, "rust", rust, "lua", parse_lua(lua_source, lua_name))

    logger.debug("Checking ScraperStatusEvent...")
    status_rust = parse_rust(STATUS_RUST_PATH.read_text(encoding="utf-8"), "ScraperStatusEvent", STATUS_RUST_PATH)
    status_rust = {name: optional for name, optional in status_rust.items() if name not in STATUS_RUST_ONLY_FIELDS}
    status_typescript = parse_typescript(STATUS_TYPESCRIPT_PATH.read_text(encoding="utf-8"), "IPCStatusEvent", STATUS_TYPESCRIPT_PATH)
    problems += compare("ScraperStatusEvent", "rust", status_rust, "typescript", status_typescript)

    logger.debug("Checking UniChatEventFactory...")
    for variant in missing_factories(rust_source, lua_source):
        problems.append(f"UniChatEvent::{variant}: no factory in UniChatEventFactory")

    if not problems:
        logger.info("Event contract parity check completed.")
        sys.exit(0)

    logger.warn(f"Found {len(problems)} contract issue(s):")
    for problem in problems:
        logger.warn(f" - {problem}")
    sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")
        exit(0)
