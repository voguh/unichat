/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::sync::Arc;

use anyhow::Error;

use crate::plugins::get_plugin;
use crate::plugins::instance::env::unichat_api::UniChatAPI;
use crate::plugins::instance::env::unichat_event::LuaUniChatAuthorTypeFactory;
use crate::plugins::instance::env::unichat_event::LuaUniChatBadgeFactory;
use crate::plugins::instance::env::unichat_event::LuaUniChatEmoteFactory;
use crate::plugins::instance::env::unichat_event::LuaUniChatEventFactory;
use crate::plugins::instance::env::unichat_event::LuaUniChatPlatformFactory;
use crate::plugins::instance::env::unichat_http::UniChatHttpModule;
use crate::plugins::instance::env::unichat_json::UniChatJsonModule;
use crate::plugins::instance::env::unichat_logger::UniChatLoggerModule;
use crate::plugins::instance::env::unichat_strings::UniChatStringsModule;
use crate::plugins::instance::env::unichat_time::UniChatTimeModule;
use crate::plugins::instance::env::unichat_yaml::UniChatYamlModule;
use crate::plugins::runtime;
use crate::utils::safe_guard_path;
use crate::utils::semver::Version;

mod shared_modules;
mod unichat_api;
mod unichat_event;
mod unichat_http;
mod unichat_json;
mod unichat_logger;
mod unichat_strings;
mod unichat_time;
mod unichat_yaml;
mod utils;

const PLUGIN_NAME_KEY: &str = "__PLUGIN_NAME";
const PLUGIN_VERSION_KEY: &str = "__PLUGIN_VERSION";
const UNICHAT_API_KEY: &str = "UniChatAPI";
const UNICHAT_EVENT_KEY: &str = "UniChatEvent";
const UNICHAT_PLATFORM_KEY: &str = "UniChatPlatform";
const UNICHAT_AUTHOR_TYPE_KEY: &str = "UniChatAuthorType";
const UNICHAT_EMOTE_KEY: &str = "UniChatEmote";
const UNICHAT_BADGE_KEY: &str = "UniChatBadge";

/* ========================================================================== */

fn create_print_fn(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Function, mlua::Error> {
    let plugin_name: Arc<String> = Arc::new(plugin_name.to_string());
    let print_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let mut output_parts: Vec<String> = Vec::new();

        for arg in args.into_iter() {
            if let Some(arg_str) = lua.coerce_string(arg)? {
                let str = arg_str.to_string_lossy();
                output_parts.push(str);
            } else {
                output_parts.push(String::from("<non-stringifiable>"));
            }
        }

        let output = output_parts.join("\t");
        log::info!(target: &format!("plugin:{}", plugin_name), "{}", output);
        return Ok(());
    })?;

    return Ok(print_func);
}

/* ========================================================================== */

fn scoped_modules_require(lua: &mlua::Lua, plugin_env: &mlua::Table, plugin_name: &str, module: &str) -> mlua::Result<mlua::Value> {
    if module == "unichat:http" {
        return UniChatHttpModule::new(lua);
    } else if module == "unichat:json" {
        return UniChatJsonModule::new(lua);
    } else if module == "unichat:logger" {
        return UniChatLoggerModule::new(lua, plugin_name);
    } else if module == "unichat:strings" {
        return UniChatStringsModule::new(lua);
    } else if module == "unichat:time" {
        return UniChatTimeModule::new(lua);
    } else if module == "unichat:yaml" {
        return UniChatYamlModule::new(lua);
    }

    let manifest = get_plugin(plugin_name).map_err(mlua::Error::external)?;
    let plugin_root = manifest.get_data_path();
    let mut module_path = module.replace('.', "/");
    if !module_path.ends_with(".lua") {
        module_path.push_str(".lua");
    }

    let path = safe_guard_path(&plugin_root, &module_path).map_err(mlua::Error::external)?;
    let code = fs::read_to_string(path).map_err(|e| mlua::Error::external(e))?;
    let result: mlua::Value = lua.load(&code).set_environment(plugin_env.clone()).eval()?;

    return Ok(result);
}

fn create_require_fn(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Function, mlua::Error> {
    let plugin_name: Arc<String> = Arc::new(plugin_name.to_string());
    let require_fn = lua.create_function(move |lua, module: String| -> mlua::Result<mlua::Value> {
        let plugin = get_plugin(&plugin_name).map_err(mlua::Error::external)?;
        if let Ok(cached_module) = plugin.get_cached_loaded_module(&module) {
            return Ok(cached_module);
        }

        let plugin_env = plugin.get_plugin_env().map_err(mlua::Error::external)?;
        if module.contains(':') && !module.starts_with("unichat:") {
            if let Some(shared_module) = shared_modules::get(&module).map_err(mlua::Error::external)? {
                return Ok(shared_module);
            }
        } else {
            let result = scoped_modules_require(lua, &plugin_env, &plugin_name, &module)?;
            let saved_module = plugin.set_cached_loaded_module(&module, result).map_err(mlua::Error::external)?;
            return Ok(saved_module);
        }

        return Err(mlua::Error::runtime(format!("Module '{}' not found for plugin '{}'", module, plugin_name)));
    })?;

    return Ok(require_fn);
}

/* ========================================================================== */

pub fn load_env(plugin_name:&str, plugin_version: &Version, plugin_env: mlua::Table) -> Result<(), Error> {
    let lua = runtime::get()?;

    /* <======================[ LUA Standard Library ]======================> */
    let print_func = create_print_fn(&lua, plugin_name)?;
    plugin_env.set("print", print_func)?;

    let require_fn = create_require_fn(&lua, plugin_name)?;
    plugin_env.set("require", require_fn)?;
    /* <====================[ End LUA Standard Library ]====================> */

    /* <====================[ UniChat Standard Library ]====================> */
    plugin_env.set(PLUGIN_NAME_KEY, plugin_name.to_string())?;
    plugin_env.set(PLUGIN_VERSION_KEY, plugin_version.to_string())?;
    plugin_env.set(UNICHAT_API_KEY, UniChatAPI::new(plugin_name))?;
    plugin_env.set(UNICHAT_EVENT_KEY, LuaUniChatEventFactory)?;
    plugin_env.set(UNICHAT_PLATFORM_KEY, LuaUniChatPlatformFactory)?;
    plugin_env.set(UNICHAT_AUTHOR_TYPE_KEY, LuaUniChatAuthorTypeFactory)?;
    plugin_env.set(UNICHAT_EMOTE_KEY, LuaUniChatEmoteFactory)?;
    plugin_env.set(UNICHAT_BADGE_KEY, LuaUniChatBadgeFactory)?;
    /* <==================[ End UniChat Standard Library ]==================> */

    let mt = lua.create_table()?;
    mt.set("__index", lua.globals())?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;
    plugin_env.set_metatable(Some(mt))?;

    return Ok(());
}
