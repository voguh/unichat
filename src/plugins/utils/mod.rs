/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

pub fn table_deep_readonly(lua: &mlua::Lua, table_name: &mlua::Value, table: mlua::Table) -> Result<mlua::Table, mlua::Error> {
    let mt = lua.create_table()?;

    let table_name = table_name.to_string()?;
    let newindex_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| -> mlua::Result<()> {
        return Err(mlua::Error::runtime(format!("Immutable table: cannot modify table '{}'", table_name)));
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;

    for pair in table.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(inner_table) = value {
            let readonly_inner_table = table_deep_readonly(lua, &key, inner_table)?;
            table.set(key, readonly_inner_table)?;
        } else {
            table.set(key, value)?;
        }
    }

    table.set_metatable(Some(mt))?;

    return Ok(table);
}

/* ================================================================================================================== */

const INCLUSIVE_START: char = '[';
const INCLUSIVE_END: char = ']';
const EXCLUSIVE_START: char = '(';
const EXCLUSIVE_END: char = ')';

pub fn parse_dependency_version(version: &str) -> Result<semver::VersionReq, Error> {
    let v = version.trim();

    let first = v.chars().next();
    let last = v.chars().last();

    if matches!(first, Some(INCLUSIVE_START | EXCLUSIVE_START)) && matches!(last, Some(INCLUSIVE_END | EXCLUSIVE_END)) {
        let (min, max) = v[1..v.len() -1].split_once(',').ok_or(anyhow!("Invalid dependency version range: '{}'", version))?;
        let min = min.trim();
        let max = max.trim();

        let mut parts = Vec::new();
        if !min.is_empty() {
            let min_op = if first == Some(INCLUSIVE_START) { ">=" } else { ">" };
            parts.push(format!("{} {}", min_op, min));
        }

        if !max.is_empty() {
            let max_op = if last == Some(INCLUSIVE_END) { "<=" } else { "<" };
            parts.push(format!("{} {}", max_op, max));
        }

        let range_str = parts.join(", ");
        let version_req = semver::VersionReq::parse(&range_str)?;
        return Ok(version_req);
    }

    let version_req = semver::VersionReq::parse(version)?;
    return Ok(version_req);
}

pub fn parse_dependencies(raw_dependencies: &Vec<String>) -> Result<Vec<(String, semver::VersionReq)>, Error> {
    let mut dependencies: Vec<(String, semver::VersionReq)> = Vec::new();

    for dep in raw_dependencies {
        let parts: Vec<&str> = dep.splitn(2, '@').collect();
        if parts.len() != 2 {
            return Err(anyhow!("Invalid dependency format: '{}'. Expected format is 'name@version_req'", dep));
        }

        let name = parts[0].trim().to_string();
        let version = parts[1].trim();
        let version_req = parse_dependency_version(version)?;

        dependencies.push((name, version_req));
    }

    return Ok(dependencies);
}
