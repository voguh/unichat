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

use crate::utils::semver;

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

pub fn parse_dependencies(raw_dependencies: &Vec<String>) -> Result<Vec<(String, semver::VersionRange)>, Error> {
    let mut dependencies: Vec<(String, semver::VersionRange)> = Vec::new();

    for dep in raw_dependencies {
        let parts: Vec<&str> = dep.splitn(2, '@').collect();
        if parts.len() != 2 {
            return Err(anyhow!("Invalid dependency format: '{}'. Expected format is 'name@version_req'", dep));
        }

        let name = parts[0].trim().to_string();
        let version = parts[1].trim();
        let version_req = semver::VersionRange::parse(version)?;

        dependencies.push((name, version_req));
    }

    return Ok(dependencies);
}
