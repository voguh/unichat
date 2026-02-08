/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

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

pub struct UniChatLoggerModule {
    plugin_name: String,
}

impl UniChatLoggerModule {
    pub fn new(lua: &mlua::Lua, plugin_name: &str) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatLoggerModule { plugin_name: plugin_name.to_string() })?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatLoggerModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("debug", move |lua, this, args: mlua::Variadic<mlua::Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::debug!(target: &this.plugin_name, "{}", msg);
            if let Some(err) = err {
                log::error!(target: &this.plugin_name, "{:?}", err);
            }

            return Ok(());
        });

        methods.add_method("info", move |lua, this, args: mlua::Variadic<mlua::Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::info!(target: &this.plugin_name, "{}", msg);
            if let Some(err) = err {
                log::error!(target: &this.plugin_name, "{:?}", err);
            }

            return Ok(());
        });

        methods.add_method("warn", move |lua, this, args: mlua::Variadic<mlua::Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::warn!(target: &this.plugin_name, "{}", msg);
            if let Some(err) = err {
                log::error!(target: &this.plugin_name, "{:?}", err);
            }

            return Ok(());
        });

        methods.add_method("error", move |lua, this, args: mlua::Variadic<mlua::Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::error!(target: &this.plugin_name, "{}", msg);
            if let Some(err) = err {
                log::error!(target: &this.plugin_name, "{:?}", err);
            }

            return Ok(());
        });
    }
}
