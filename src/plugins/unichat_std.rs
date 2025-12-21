/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::sync::Arc;

use crate::plugins::get_loaded_plugin;
use crate::plugins::unichat_api::SHARED_MODULES;
use crate::plugins::unichat_json;
use crate::plugins::unichat_logger;
use crate::plugins::unichat_strings;
use crate::plugins::unichat_time;
use crate::plugins::unichat_yaml;
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
        let plugin = get_loaded_plugin(&plugin_name)?;
        if let Ok(cached_module) = plugin.get_cached_loaded_module(&module) {
            return Ok(cached_module);
        }

        fn scoped_modules_require(lua: &mlua::Lua, plugin_env: &mlua::Table, plugin_name: &str, module: &str) -> mlua::Result<mlua::Value> {
            if module == "unichat:json" {
                return unichat_json::create_module(lua);
            } else if module == "unichat:logger" {
                return unichat_logger::create_module(lua, plugin_name);
            } else if module == "unichat:strings" {
                return unichat_strings::create_module(lua);
            } else if module == "unichat:time" {
                return unichat_time::create_module(lua);
            } else if module == "unichat:yaml" {
                return unichat_yaml::create_module(lua);
            }

            let manifest = get_loaded_plugin(plugin_name)?;
            let plugin_root = manifest.get_plugin_data_path();
            let mut module_path = module.replace('.', "/");
            if !module_path.ends_with(".lua") {
                module_path.push_str(".lua");
            }

            let path = safe_guard_path(&plugin_root, &module_path).map_err(mlua::Error::runtime)?;
            let code = fs::read_to_string(path).map_err(|e| mlua::Error::external(e))?;
            let result: mlua::Value = lua.load(&code).set_environment(plugin_env.clone()).eval()?;

            return Ok(result);
        }

        let plugin_env = plugin.get_plugin_env()?;
        if let Ok(result) = scoped_modules_require(lua, &plugin_env, &plugin_name, &module) {
            let arc_loaded_module = Arc::new(result);
            let saved_module = plugin.set_cached_loaded_module(&module, arc_loaded_module)?;
            return Ok(saved_module.as_ref().clone());
        } else if module.contains(':') {
            let shared_modules = SHARED_MODULES.read().map_err(mlua::Error::runtime)?;
            if let Some(shared_module) = shared_modules.get(&module) {
                return Ok(shared_module.as_ref().clone());
            }
        }

        return Err(mlua::Error::runtime(format!("Module '{}' not found for plugin '{}'", module, plugin_name)));
    })?;

    return Ok(require_fn);
}
