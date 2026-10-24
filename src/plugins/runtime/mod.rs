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

pub fn initialized() -> bool {
    return LUA_RUNTIME.get().is_some();
}

pub fn new() -> Result<(), Error> {
    log::info!("Configuring LUA runtime");
    let lua = Lua::new();
    let _globals = lua.globals();

    /* <======================[ LUA Standard Library ]======================> */
    log::debug!("Configuring LUA standard library");
    _globals.set("_G", Value::Nil)?;
    _globals.set("coroutine", Value::Nil)?;
    _globals.set("debug", Value::Nil)?;
    _globals.set("dofile", Value::Nil)?;
    _globals.set("getmetatable", Value::Nil)?;
    _globals.set("io", Value::Nil)?;
    _globals.set("load", Value::Nil)?;
    _globals.set("loadfile", Value::Nil)?;

    let _os: Table = _globals.get("os")?;
    _os.set("execute", Value::Nil)?;
    _os.set("exit", Value::Nil)?;
    _os.set("getenv", Value::Nil)?;
    _os.set("remove", Value::Nil)?;
    _os.set("rename", Value::Nil)?;
    _os.set("setlocale", Value::Nil)?;
    _os.set("tmpname", Value::Nil)?;
    _globals.set("os", _os)?;

    _globals.set("package", Value::Nil)?;
    _globals.set("print", Value::Nil)?;
    _globals.set("rawequal", Value::Nil)?;
    _globals.set("rawget", Value::Nil)?;
    _globals.set("rawlen", Value::Nil)?;
    _globals.set("rawset", Value::Nil)?;
    _globals.set("require", Value::Nil)?;

    _globals.set("setmetatable", Value::Nil)?;

    let _string: Table = _globals.get("string")?;
    _string.set("dump", Value::Nil)?;
    _globals.set("string", _string)?;
    /* <====================[ End LUA Standard Library ]====================> */

    lua.set_globals(_globals)?;
    log::debug!("LUA runtime configured successfully");

    set(lua);

    return Ok(());
}
