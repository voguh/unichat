/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use log::Level;
use mlua::Error;
use mlua::Lua;
use mlua::LuaSerdeExt as _;
use mlua::UserData;
use mlua::UserDataMethods;
use mlua::Value;
use mlua::Variadic;

/* ========================================================================== */

fn format_str(lua: &Lua, mut args: Variadic<Value>) -> Result<(String, Option<Error>), Error> {
    if args.is_empty() {
        return Err(Error::external("No log message provided"));
    }

    let msg = args.remove(0);
    let mut msg: String = lua.from_value(msg)?;
    if msg.trim().is_empty() {
        return Err(Error::external("Empty log message"));
    }

    let mut error: Option<Box<Error>> = None;
    if args.last().is_some_and(|v| v.is_error()) {
        if let Some(Value::Error(e)) = args.pop() {
            error = Some(e);
        }
    }

    for arg in args.into_iter() {
        if let Some(arg_str) = lua.coerce_string(arg)? {
            msg = msg.replacen("{}", &arg_str.to_string_lossy(), 1);
        } else {
            msg = msg.replacen("{}", "<non-stringifiable>", 1);
        }
    }

    return Ok((msg, error.map(|e| *e)));
}

fn write_log(lua: &Lua, plugin_id: &str, level: Level, args: Variadic<Value>) -> Result<(), Error> {
    let (msg, err) = format_str(lua, args)?;
    let target = format!("plugin:{}", plugin_id);

    log::log!(target: &target, level, "{}", msg);
    if let Some(err) = err {
        log::error!(target: &target, "{:#?}", err);
    }

    return Ok(());
}

pub struct UniChatLoggerModule {
    plugin_id: String
}

impl UniChatLoggerModule {
    pub fn new(lua: &Lua, plugin_id: &str) -> Result<Value, Error> {
        let userdata = lua.create_userdata(UniChatLoggerModule { plugin_id: plugin_id.to_string() })?;
        return Ok(Value::UserData(userdata));
    }
}

impl UserData for UniChatLoggerModule {
    fn add_methods<M: UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("debug", |lua, this, args: Variadic<Value>| {
            return write_log(lua, &this.plugin_id, Level::Debug, args);
        });

        methods.add_method("info", |lua, this, args: Variadic<Value>| {
            return write_log(lua, &this.plugin_id, Level::Info, args);
        });

        methods.add_method("warn", |lua, this, args: Variadic<Value>| {
            return write_log(lua, &this.plugin_id, Level::Warn, args);
        });

        methods.add_method("error", |lua, this, args: Variadic<Value>| {
            return write_log(lua, &this.plugin_id, Level::Error, args);
        });
    }
}
