/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashSet;
use std::ffi::c_void;

use mlua::LuaSerdeExt as _;
use serde::de::DeserializeOwned;

/* ========================================================================== */

const READONLY_DATA_KEY: &str = "__unichat_readonly_data";

pub fn table_deep_readonly(lua: &mlua::Lua, table_name: &mlua::Value, table: mlua::Table) -> Result<mlua::Table, mlua::Error> {
    for pair in table.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(inner_table) = value {
            let readonly_inner_table = table_deep_readonly(lua, &key, inner_table)?;
            table.raw_set(key, readonly_inner_table)?;
        }
    }

    let table_name = table_name.to_string()?;
    let newindex_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| -> mlua::Result<()> {
        return Err(mlua::Error::runtime(format!("Immutable table: cannot modify table '{}'", table_name)));
    })?;

    let len_table = table.clone();
    let len_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| {
        return Ok(len_table.raw_len());
    })?;

    let next_func: mlua::Function = lua.globals().get("next")?;
    let pairs_table = table.clone();
    let pairs_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| {
        return Ok((next_func.clone(), pairs_table.clone(), mlua::Value::Nil));
    })?;

    let mt = lua.create_table()?;
    mt.set("__index", table.clone())?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__len", len_func)?;
    mt.set("__pairs", pairs_func)?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;
    mt.set(READONLY_DATA_KEY, table)?;

    let proxy = lua.create_table()?;
    proxy.set_metatable(Some(mt))?;

    return Ok(proxy);
}

fn table_deep_unwrap(lua: &mlua::Lua, value: mlua::Value, visiting: &mut HashSet<*const c_void>) -> Result<mlua::Value, mlua::Error> {
    if !value.is_table() {
        return Ok(value);
    }

    let table: mlua::Table = lua.unpack(value)?;

    let source = match table.metatable() {
        Some(mt) => mt.raw_get::<Option<mlua::Table>>(READONLY_DATA_KEY)?.unwrap_or(table),
        None => table
    };

    let pointer = source.to_pointer();
    if !visiting.insert(pointer) {
        return Err(mlua::Error::runtime("Recursive table detected"));
    }

    let copy = lua.create_table()?;
    for pair in source.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        let result = table_deep_unwrap(lua, value, visiting)?;
        copy.raw_set(key, result)?;
    }

    if let Some(mt) = source.metatable() {
        if mt.to_pointer() == lua.array_metatable().to_pointer() {
            copy.set_metatable(Some(mt))?;
        }
    }

    visiting.remove(&pointer);

    return Ok(mlua::Value::Table(copy));
}

pub fn from_lua_value<T: DeserializeOwned>(lua: &mlua::Lua, value: mlua::Value) -> Result<T, mlua::Error> {
    let unwrapped = table_deep_unwrap(lua, value, &mut HashSet::new())?;
    return lua.from_value(unwrapped);
}
