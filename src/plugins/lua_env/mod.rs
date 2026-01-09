/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::OnceLock;
use std::sync::RwLock;

use anyhow::anyhow;
use anyhow::Error;

use crate::plugins::UniChatPlugin;
use crate::plugins::get_lua_runtime;
use crate::plugins::lua_env::unichat_api::UniChatAPI;
use crate::plugins::lua_env::unichat_event::LuaUniChatAuthorTypeFactory;
use crate::plugins::lua_env::unichat_event::LuaUniChatBadgeFactory;
use crate::plugins::lua_env::unichat_event::LuaUniChatEmoteFactory;
use crate::plugins::lua_env::unichat_event::LuaUniChatEventFactory;
use crate::plugins::lua_env::unichat_event::LuaUniChatPlatformFactory;
use crate::plugins::lua_env::unichat_std::create_print_fn;
use crate::plugins::lua_env::unichat_std::create_require_fn;
use crate::plugins::utils::table_deep_readonly;
use crate::utils::get_current_timestamp;

mod unichat_api;
mod unichat_event;
mod unichat_json;
mod unichat_logger;
mod unichat_std;
mod unichat_strings;
mod unichat_time;
mod unichat_yaml;

const PLUGIN_NAME_KEY: &str = "__PLUGIN_NAME";
const PLUGIN_VERSION_KEY: &str = "__PLUGIN_VERSION";
const UNICHAT_API_KEY: &str = "UniChatAPI";
const UNICHAT_EVENT_KEY: &str = "UniChatEvent";
const UNICHAT_PLATFORM_KEY: &str = "UniChatPlatform";
const UNICHAT_AUTHOR_TYPE_KEY: &str = "UniChatAuthorType";
const UNICHAT_EMOTE_KEY: &str = "UniChatEmote";
const UNICHAT_BADGE_KEY: &str = "UniChatBadge";

pub const LUA_RUNTIME_ONCE_LOCK_KEY: &str = "Plugins::LUA_RUNTIME";
pub static LUA_RUNTIME: OnceLock<Arc<mlua::Lua>> = OnceLock::new();

pub const SHARED_MODULES_LAZY_LOCK_KEY: &str = "Plugins::SHARED_MODULES";
pub static SHARED_MODULES: LazyLock<RwLock<HashMap<String, Arc<mlua::Value>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ================================================================================================================== */

pub fn prepare_lua_env() -> Result<(), Error> {
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

    log::debug!("Setting LUA globals as read-only");
    for pair in _globals.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(table) = value {
            let readonly_table = table_deep_readonly(&lua, &key, table)?;
            _globals.set(key, readonly_table)?;
        }
    }

    lua.set_globals(_globals)?;
    log::debug!("LUA runtime configured successfully");

    return LUA_RUNTIME.set(Arc::new(lua)).map_err(|_| anyhow!("{} was already initialized", LUA_RUNTIME_ONCE_LOCK_KEY));
}

/* ================================================================================================================== */

pub fn load_plugin_env(plugin: &Arc<UniChatPlugin>) -> Result<(), Error> {
    let lua = get_lua_runtime()?;
    let plugin_env = plugin.get_plugin_env()?;

    /* <======================[ LUA Standard Library ]======================> */
    let print_func = create_print_fn(&lua, &plugin.name)?;
    plugin_env.set("print", print_func)?;

    let require_fn = create_require_fn(&lua, &plugin.name)?;
    plugin_env.set("require", require_fn)?;
    /* <====================[ End LUA Standard Library ]====================> */

    /* <====================[ UniChat Standard Library ]====================> */
    plugin_env.set(PLUGIN_NAME_KEY, plugin.name.clone())?;
    plugin_env.set(PLUGIN_VERSION_KEY, plugin.version.to_string())?;
    plugin_env.set(UNICHAT_API_KEY, UniChatAPI::new(&plugin.name))?;
    plugin_env.set(UNICHAT_PLATFORM_KEY, LuaUniChatPlatformFactory)?;
    plugin_env.set(UNICHAT_AUTHOR_TYPE_KEY, LuaUniChatAuthorTypeFactory)?;
    plugin_env.set(UNICHAT_EVENT_KEY, LuaUniChatEventFactory)?;
    plugin_env.set(UNICHAT_EMOTE_KEY, LuaUniChatEmoteFactory)?;
    plugin_env.set(UNICHAT_BADGE_KEY, LuaUniChatBadgeFactory)?;
    /* <==================[ End UniChat Standard Library ]==================> */

    let mt = lua.create_table()?;
    let mut protected_keys: HashSet<String> = HashSet::new();
    for pair in lua.globals().pairs::<mlua::Value, mlua::Value>() {
        let (k, _) = pair?;
        if let mlua::Value::String(s) = k {
            protected_keys.insert(s.to_string_lossy().to_string());
        }
    }
    for pair in plugin_env.pairs::<mlua::Value, mlua::Value>() {
        let (k, _) = pair?;
        if let mlua::Value::String(s) = k {
            protected_keys.insert(s.to_string_lossy().to_string());
        }
    }
    let newindex_func = lua.create_function(move |_, (table, key, value): (mlua::Table, mlua::Value, mlua::Value)| -> mlua::Result<()> {
        if let mlua::Value::String(key) = &key  {
            let k = key.to_string_lossy();
            if protected_keys.contains(k.as_str()) {
                return Err(mlua::Error::runtime(format!("Immutable table: cannot modify key '{}'", k)));
            }
        }

        table.raw_set(key, value)?;
        return Ok(());
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__index", lua.globals())?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;
    plugin_env.set_metatable(Some(mt))?;

    /* ========================================================================================== */

    let start_ms = get_current_timestamp()?;
    log::info!("Executing plugin entrypoint for plugin: {} v{}", plugin.name, plugin.version);
    let entrypoint_code = fs::read_to_string(plugin.get_entrypoint_path())?;
    lua.load(&entrypoint_code).set_environment(plugin_env.as_ref().clone()).exec()?;
    let end_ms = get_current_timestamp()?;
    log::info!("Plugin '{}' initialized in {} ms", plugin.name, end_ms - start_ms);
    plugin.add_message(format!("Initialization finished in {}ms", end_ms - start_ms));

    return Ok(());
}
