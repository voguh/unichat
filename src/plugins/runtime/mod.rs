/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::OnceLock;

use anyhow::Error;
use mlua::Lua;
use mlua::LuaOptions;
use mlua::StdLib;
use mlua::Table;
use mlua::Value;

/* ========================================================================== */

static LUA_RUNTIME: OnceLock<Lua> = OnceLock::new();
pub fn get() -> &'static Lua {
    return LUA_RUNTIME.get().expect("Plugins::LUA_RUNTIME was not initialized");
}

fn set(lua: Lua) {
    LUA_RUNTIME.set(lua).expect("Plugins::LUA_RUNTIME was already initialized");
}

/* ========================================================================== */

const MEMORY_LIMIT: usize = 256 * 1024 * 1024;

pub fn initialized() -> bool {
    return LUA_RUNTIME.get().is_some();
}

pub fn new() -> Result<(), Error> {
    log::info!("Configuring LUA runtime");
    let libs = StdLib::STRING | StdLib::TABLE | StdLib::MATH | StdLib::UTF8;
    let lua = Lua::new_with(libs, LuaOptions::default())?;
    lua.set_memory_limit(MEMORY_LIMIT)?;

    /* <======================[ LUA Standard Library ]======================> */
    log::debug!("Configuring LUA standard library");
    let globals = lua.globals();
    globals.set("_G", Value::Nil)?;
    globals.set("dofile", Value::Nil)?;
    globals.set("getmetatable", Value::Nil)?;
    globals.set("load", Value::Nil)?;
    globals.set("loadfile", Value::Nil)?;
    globals.set("print", Value::Nil)?;
    globals.set("rawequal", Value::Nil)?;
    globals.set("rawget", Value::Nil)?;
    globals.set("rawlen", Value::Nil)?;
    globals.set("rawset", Value::Nil)?;
    globals.set("setmetatable", Value::Nil)?;

    let string: Table = globals.get("string")?;
    string.set("dump", Value::Nil)?;
    /* <====================[ End LUA Standard Library ]====================> */

    log::debug!("LUA runtime configured successfully");
    set(lua);

    return Ok(());
}
