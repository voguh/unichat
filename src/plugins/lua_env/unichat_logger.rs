/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::Arc;

use mlua::LuaSerdeExt as _;

use crate::plugins::utils::table_deep_readonly;

fn format_str(lua: &mlua::Lua, args: mlua::Variadic<mlua::Value>) -> Result<(String, Option<mlua::Error>), mlua::Error> {
    if args.is_empty() {
        return Err(mlua::Error::external("No log message provided"));
    }

    let mut args = args;

    let msg = args.remove(0);
    let mut msg: String  = lua.from_value(msg)?;
    if msg.trim().is_empty() {
        return Err(mlua::Error::external("Empty log message"));
    }

    let mut error: Option<Box<mlua::Error>> = None;
    if args.last().is_some_and(|v| v.is_error()) {
        let last_arg = args.pop().unwrap();
        if let mlua::Value::Error(e) = last_arg {
            error = Some(e);
        }
    }

    for arg in args.into_iter() {
        if let Some(arg_str) =  lua.coerce_string(arg)? {
            let str = arg_str.to_string_lossy();
            msg = msg.replacen("{}", &str, 1);
        } else {
            msg = msg.replacen("{}", "<non-stringifiable>", 1);
        }
    }

    return Ok((msg, error.map(|e| *e)));
}

pub fn create_module(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Value, mlua::Error> {
    let target: Arc<str> = format!("plugin:{}", plugin_name).into();
    let module = lua.create_table()?;

    let debug_target = target.clone();
    let debug_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let (msg, err) = format_str(lua, args)?;

        log::debug!(target: &debug_target, "{}", msg);
        if let Some(err) = err {
            log::error!(target: &debug_target, "{:?}", err);
        }

        return Ok(());
    })?;
    module.set("debug", debug_func)?;

    let info_target = target.clone();
    let info_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let (msg, err) = format_str(lua, args)?;

        log::info!(target: &info_target, "{}", msg);
        if let Some(err) = err {
            log::error!(target: &info_target, "{:?}", err);
        }

        return Ok(());
    })?;
    module.set("info", info_func)?;

    let warn_target = target.clone();
    let warn_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let (msg, err) = format_str(lua, args)?;

        log::warn!(target: &warn_target, "{}", msg);
        if let Some(err) = err {
            log::error!(target: &warn_target, "{:?}", err);
        }

        return Ok(());
    })?;
    module.set("warn", warn_func)?;

    let error_target = target.clone();
    let error_func = lua.create_function(move |lua, args: mlua::Variadic<mlua::Value>| {
        let (msg, err) = format_str(lua, args)?;

        log::error!(target: &error_target, "{}", msg);
        if let Some(err) = err {
            log::error!(target: &error_target, "{:?}", err);
        }

        return Ok(());
    })?;
    module.set("error", error_func)?;

    let table_name = lua.create_string("unichat:logger")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module)?;

    return Ok(mlua::Value::Table(readonly_module));
}
