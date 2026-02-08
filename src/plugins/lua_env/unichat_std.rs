/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::sync::Arc;

use crate::plugins::get_plugin;

use crate::plugins::lua_env::SHARED_MODULES;
use crate::plugins::lua_env::SHARED_MODULES_LAZY_LOCK_KEY;
use crate::plugins::lua_env::unichat_http::UniChatHttpModule;
use crate::plugins::lua_env::unichat_json::UniChatJsonModule;
use crate::plugins::lua_env::unichat_logger::UniChatLoggerModule;
use crate::plugins::lua_env::unichat_strings::UniChatStringsModule;
use crate::plugins::lua_env::unichat_time::UniChatTimeModule;
use crate::plugins::lua_env::unichat_yaml::UniChatYamlModule;
use crate::utils::safe_guard_path;

pub fn create_print_fn(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Function, mlua::Error> {
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

pub fn create_require_fn(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Function, mlua::Error> {
    let plugin_name: Arc<String> = Arc::new(plugin_name.to_string());
    let require_fn = lua.create_function(move |lua, module: String| -> mlua::Result<mlua::Value> {
        let plugin = get_plugin(&plugin_name).map_err(mlua::Error::external)?;
        if let Ok(cached_module) = plugin.get_cached_loaded_module(&module) {
            return Ok(cached_module);
        }

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

        let plugin_env = plugin.get_plugin_env().map_err(mlua::Error::external)?;
        if let Ok(result) = scoped_modules_require(lua, &plugin_env, &plugin_name, &module) {
            let arc_loaded_module = Arc::new(result);
            let saved_module = plugin.set_cached_loaded_module(&module, arc_loaded_module).map_err(mlua::Error::external)?;
            return Ok(saved_module.as_ref().clone());
        } else if module.contains(':') {
            let shared_modules = SHARED_MODULES.read().map_err(|_| mlua::Error::external(format!("{} lock poisoned", SHARED_MODULES_LAZY_LOCK_KEY)))?;
            if let Some(shared_module) = shared_modules.get(&module) {
                return Ok(shared_module.as_ref().clone());
            }
        }

        return Err(mlua::Error::runtime(format!("Module '{}' not found for plugin '{}'", module, plugin_name)));
    })?;

    return Ok(require_fn);
}
