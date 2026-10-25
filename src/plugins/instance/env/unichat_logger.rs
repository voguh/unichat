/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::Error;
use mlua::Lua;
use mlua::LuaSerdeExt as _;
use mlua::UserData;
use mlua::UserDataMethods;
use mlua::Value;
use mlua::Variadic;

/* ========================================================================== */

fn format_str(lua: &Lua, args: Variadic<Value>) -> Result<(String, Option<Error>), Error> {
    if args.is_empty() {
        return Err(Error::external("No log message provided"));
    }

    let mut args = args;

    let msg = args.remove(0);
    let mut msg: String = lua.from_value(msg)?;
    if msg.trim().is_empty() {
        return Err(Error::external("Empty log message"));
    }

    let mut error: Option<Box<Error>> = None;
    if args.last().is_some_and(|v| v.is_error()) {
        let last_arg = args.pop().expect("Last argument is checked above");
        if let Value::Error(e) = last_arg {
            error = Some(e);
        }
    }

    for arg in args.into_iter() {
        if let Some(arg_str) = lua.coerce_string(arg)? {
            let str = arg_str.to_string_lossy();
            msg = msg.replacen("{}", &str, 1);
        } else {
            msg = msg.replacen("{}", "<non-stringifiable>", 1);
        }
    }

    return Ok((msg, error.map(|e| *e)));
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
        methods.add_method("debug", move |lua, this, args: Variadic<Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::debug!(target: &format!("plugin:{}", this.plugin_id), "{}", msg);
            if let Some(err) = err {
                log::error!(target: &format!("plugin:{}", this.plugin_id), "{:#?}", err);
            }

            return Ok(());
        });

        methods.add_method("info", move |lua, this, args: Variadic<Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::info!(target: &format!("plugin:{}", this.plugin_id), "{}", msg);
            if let Some(err) = err {
                log::error!(target: &format!("plugin:{}", this.plugin_id), "{:#?}", err);
            }

            return Ok(());
        });

        methods.add_method("warn", move |lua, this, args: Variadic<Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::warn!(target: &format!("plugin:{}", this.plugin_id), "{}", msg);
            if let Some(err) = err {
                log::error!(target: &format!("plugin:{}", this.plugin_id), "{:#?}", err);
            }

            return Ok(());
        });

        methods.add_method("error", move |lua, this, args: Variadic<Value>| {
            let (msg, err) = format_str(lua, args)?;

            log::error!(target: &format!("plugin:{}", this.plugin_id), "{}", msg);
            if let Some(err) = err {
                log::error!(target: &format!("plugin:{}", this.plugin_id), "{:#?}", err);
            }

            return Ok(());
        });
    }
}
