/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::path;

use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PluginManifest {
    name: String,
    description: Option<String>,
    version: String,
    author: Option<String>,
    license: Option<String>,
    homepage: Option<String>,
    dependencies: Option<Vec<String>>,
}

const INCLUSIVE_START: &str = "[";
const INCLUSIVE_END: &str = "]";
const EXCLUSIVE_START: &str = "(";
const EXCLUSIVE_END: &str = ")";

/* ============================================================================================== */

pub fn create_lua_env(
    plugin_root: path::PathBuf,
    tauri: tauri::AppHandle<tauri::Wry>
) -> Result<mlua::Lua, Box<dyn std::error::Error>> {
    let lua = mlua::Lua::new();

    let _globals = lua.globals();
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
    _globals.set("rawequal", mlua::Value::Nil)?;
    _globals.set("rawget", mlua::Value::Nil)?;
    _globals.set("rawlen", mlua::Value::Nil)?;
    _globals.set("rawset", mlua::Value::Nil)?;

    let cloned_plugin_root = plugin_root.clone();
    let require_func = lua.create_function(move |lua, module: String| {
        let mut module_path = module.replace('.', "/");
        if !module_path.ends_with(".lua") {
            module_path.push_str(".lua");
        }

        let path = cloned_plugin_root.join("data").join(module_path);

        let canonical = path.canonicalize().map_err(|e| mlua::Error::external(e))?;
        if !canonical.starts_with(&cloned_plugin_root.join("data")) {
            return Err(mlua::Error::external("Module path traversal detected"));
        }

        let code = fs::read_to_string(canonical).map_err(|e| mlua::Error::external(e))?;
        let chunk = lua.load(&code);
        let result: mlua::Value = chunk.eval()?;

        return Ok(result);
    })?;
    _globals.set("require", require_func)?;

    _globals.set("setmetatable", mlua::Value::Nil)?;

    let _string: mlua::Table = _globals.get("string")?;
    _string.set("dump", mlua::Value::Nil)?;
    _globals.set("string", _string)?;

    _globals.set("_G", _globals.clone())?;

    let entrypoint_path = plugin_root.join("data").join("main.lua");
    let entrypoint_code = fs::read_to_string(entrypoint_path)?;
    lua.load(&entrypoint_code).exec()?;

    return Ok(lua);
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    return Ok(());
}
