/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::Arc;
use std::sync::OnceLock;

use anyhow::Error;

/* ========================================================================== */

static LUA_RUNTIME: OnceLock<Arc<mlua::Lua>> = OnceLock::new();
pub fn get() -> Arc<mlua::Lua> {
    let lua = LUA_RUNTIME.get().expect("Plugins::LUA_RUNTIME was not initialized");
    return lua.clone();
}

fn set(lua: Arc<mlua::Lua>) {
    LUA_RUNTIME.set(lua).expect("Plugins::LUA_RUNTIME was already initialized");
}

/* ========================================================================== */

pub fn initialized() -> bool {
    return LUA_RUNTIME.get().is_some();
}

pub fn new() -> Result<(), Error> {
    log::info!("Configuring LUA runtime");
    let lua = mlua::Lua::new();
    let _globals = lua.globals();

    /* <======================[ LUA Standard Library ]======================> */
    log::debug!("Configuring LUA standard library");
    _globals.set("_G", mlua::Value::Nil)?;
    _globals.set("coroutine", mlua::Value::Nil)?;
    _globals.set("debug", mlua::Value::Nil)?;
    _globals.set("dofile", mlua::Value::Nil)?;
    _globals.set("getmetatable", mlua::Value::Nil)?;
    _globals.set("io", mlua::Value::Nil)?;
    _globals.set("load", mlua::Value::Nil)?;
    _globals.set("loadfile", mlua::Value::Nil)?;

    let _os: mlua::Table = _globals.get("os")?;
    _os.set("execute", mlua::Value::Nil)?;
    _os.set("exit", mlua::Value::Nil)?;
    _os.set("getenv", mlua::Value::Nil)?;
    _os.set("remove", mlua::Value::Nil)?;
    _os.set("rename", mlua::Value::Nil)?;
    _os.set("setlocale", mlua::Value::Nil)?;
    _os.set("tmpname", mlua::Value::Nil)?;
    _globals.set("os", _os)?;

    _globals.set("package", mlua::Value::Nil)?;
    _globals.set("print", mlua::Value::Nil)?;
    _globals.set("rawequal", mlua::Value::Nil)?;
    _globals.set("rawget", mlua::Value::Nil)?;
    _globals.set("rawlen", mlua::Value::Nil)?;
    _globals.set("rawset", mlua::Value::Nil)?;
    _globals.set("require", mlua::Value::Nil)?;

    _globals.set("setmetatable", mlua::Value::Nil)?;

    let _string: mlua::Table = _globals.get("string")?;
    _string.set("dump", mlua::Value::Nil)?;
    _globals.set("string", _string)?;
    /* <====================[ End LUA Standard Library ]====================> */

    lua.set_globals(_globals)?;
    log::debug!("LUA runtime configured successfully");

    set(Arc::new(lua));

    return Ok(());
}

