/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

//! The event contract is hand-written in three places: the Rust structs in this module, the
//! TypeScript definitions widget authors consume, and the Lua annotations plugin authors consume.
//!
//! Nothing keeps them in sync, and they had already drifted apart in nine places. These tests read
//! all three files and fail when a payload's fields disagree on name or optionality.
//!
//! Text is compared, not generated: the '**Disclaimer:**' prose in the TypeScript file carries
//! knowledge no generator could reproduce.

use std::collections::BTreeMap;
use std::path::PathBuf;

const RUST_SOURCE: &str = include_str!("unichat.rs");
const TYPESCRIPT_SOURCE: &str = include_str!("../../widgets/unichat.d.ts");
const LUA_SOURCE: &str = include_str!("../../plugins/.types/UniChatAPI.lua");

/// Payloads under parity, as (Rust struct, TypeScript interface, Lua class).
const PAYLOADS: [(&str, &str, &str); 11] = [
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
];

/// Field name in camelCase -> whether the field is nullable.
type Fields = BTreeMap<String, bool>;

fn to_camel_case(snake_case: &str) -> String {
    let mut out = String::with_capacity(snake_case.len());
    let mut upper_next = false;

    for c in snake_case.chars() {
        if c == '_' {
            upper_next = true;
        } else if upper_next {
            out.extend(c.to_uppercase());
            upper_next = false;
        } else {
            out.push(c);
        }
    }

    return out;
}

/// Body of a block that opens on the line matching `header` and closes on the first line that is
/// exactly `closer` at the start of a line.
fn block_after<'a>(source: &'a str, header: &str, closer: &str) -> Option<&'a str> {
    let start = source.find(header)? + header.len();
    let rest = &source[start..];
    let end = rest.find(closer)?;

    return Some(&rest[..end]);
}

fn parse_rust(struct_name: &str) -> Fields {
    let header = format!("pub struct {} {{\n", struct_name);
    let body = block_after(RUST_SOURCE, &header, "\n}").unwrap_or_else(|| panic!("struct {} not found in unichat.rs", struct_name));

    let mut fields = Fields::new();
    for line in body.lines() {
        let line = line.trim();
        let Some(declaration) = line.strip_prefix("pub ") else { continue };
        let Some((name, kind)) = declaration.trim_end_matches(',').split_once(": ") else { continue };

        fields.insert(to_camel_case(name.trim()), kind.trim().starts_with("Option<"));
    }

    return fields;
}

fn parse_typescript(interface_name: &str) -> Fields {
    let header = format!("export interface {} {{", interface_name);
    let body = block_after(TYPESCRIPT_SOURCE, &header, "\n}").unwrap_or_else(|| panic!("interface {} not found in unichat.d.ts", interface_name));

    let mut fields = Fields::new();
    for line in body.lines() {
        let line = line.trim();
        if line.starts_with("/*") || line.starts_with("*") || line.starts_with("//") {
            continue;
        }

        let Some((name, kind)) = line.trim_end_matches(';').split_once(": ") else { continue };
        // Skips the discriminant and the 'data: {' opener.
        if name == "type" || name == "data" || kind.is_empty() {
            continue;
        }

        // Anchored at the end on purpose: 'Record<string, string | null>' is a non-nullable field
        // whose *values* are nullable.
        fields.insert(name.trim().to_owned(), kind.trim().ends_with("| null"));
    }

    return fields;
}

fn parse_lua(class_name: &str) -> Fields {
    let header = format!("---@class {}\n", class_name);
    let body = block_after(LUA_SOURCE, &header, "\n\n").unwrap_or_else(|| panic!("class {} not found in UniChatAPI.lua", class_name));

    let mut fields = Fields::new();
    for line in body.lines() {
        let Some(declaration) = line.trim().strip_prefix("---@field ") else { continue };
        let Some((name, _)) = declaration.split_once(' ') else { continue };

        let optional = name.ends_with('?');
        fields.insert(name.trim_end_matches('?').to_owned(), optional);
    }

    return fields;
}

fn report(payload: &str, left_name: &str, left: &Fields, right_name: &str, right: &Fields) -> Vec<String> {
    let mut problems = Vec::new();

    for (field, left_optional) in left {
        match right.get(field) {
            None => problems.push(format!("{}.{}: present in {} but missing in {}", payload, field, left_name, right_name)),
            Some(right_optional) if right_optional != left_optional => {
                problems.push(format!(
                    "{}.{}: optional={} in {} but optional={} in {}",
                    payload, field, left_optional, left_name, right_optional, right_name
                ));
            }
            Some(_) => {}
        }
    }

    for field in right.keys() {
        if !left.contains_key(field) {
            problems.push(format!("{}.{}: present in {} but missing in {}", payload, field, right_name, left_name));
        }
    }

    return problems;
}

#[test]
fn test_contract_parity_across_the_three_layers() {
    let mut problems = Vec::new();

    for (rust_name, typescript_name, lua_name) in PAYLOADS {
        let rust = parse_rust(rust_name);
        assert!(!rust.is_empty(), "no fields parsed out of the Rust struct {}", rust_name);

        problems.extend(report(rust_name, "rust", &rust, "typescript", &parse_typescript(typescript_name)));
        problems.extend(report(rust_name, "rust", &rust, "lua", &parse_lua(lua_name)));
    }

    assert!(problems.is_empty(), "contract drifted between the three layers:\n  {}", problems.join("\n  "));
}

/// Every variant of the enum must be reachable from a plugin, otherwise the event type exists but
/// nobody outside the first-party scrapers can emit it - which is how 'unichat:gift' stayed
/// unreachable until 1.5.0.
#[test]
fn test_every_event_variant_has_a_lua_factory() {
    let factories = block_after(LUA_SOURCE, "---@class UniChatEventFactory\n", "\n\n").expect("UniChatEventFactory not found in UniChatAPI.lua");

    let enum_body = block_after(RUST_SOURCE, "pub enum UniChatEvent {\n", "\n}").expect("enum UniChatEvent not found in unichat.rs");

    let mut missing = Vec::new();
    for line in enum_body.lines() {
        let line = line.trim();
        if line.starts_with('#') || line.is_empty() {
            continue;
        }

        let variant = line.trim_end_matches(',').split('(').next().unwrap_or_default();
        // The userstore update is emitted by the core, never by a plugin.
        if variant.is_empty() || variant == "UserstoreUpdate" {
            continue;
        }

        if !factories.contains(&format!("---@field {} fun", variant)) {
            missing.push(variant.to_owned());
        }
    }

    assert!(missing.is_empty(), "UniChatEvent variants without a Lua factory: {}", missing.join(", "));
}

/// The three contract files must exist where the include_str! calls above expect them, otherwise a
/// move would silently turn these tests into no-ops against stale copies.
#[test]
fn test_contract_files_are_where_we_think_they_are() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));

    for relative in ["src/events/unichat.rs", "widgets/unichat.d.ts", "plugins/.types/UniChatAPI.lua"] {
        assert!(root.join(relative).is_file(), "contract file is missing: {}", relative);
    }
}
