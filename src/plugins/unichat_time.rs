/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::plugins::utils::table_deep_readonly;

pub fn create_module(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
    let module = lua.create_table()?;

    let parse_func = lua.create_function(|_, value: mlua::Value| -> mlua::Result<mlua::Integer> {
        if let mlua::Value::String(str) = value {
            let str = str.to_string_lossy();
            let datetime = time::OffsetDateTime::parse(&str, &time::format_description::well_known::Rfc3339)
                .map_err(|e| mlua::Error::external(format!("Failed to parse time: {}", e)))?;
            return Ok(datetime.unix_timestamp());
        } else if let mlua::Value::Integer(ts) = value {
            return Ok(ts);
        } else if let mlua::Value::Number(num) = value {
            return Ok(num as mlua::Integer);
        }

        return Err(mlua::Error::external("Unknown time format"));
    })?;
    module.set("parse", parse_func)?;

    let now_func = lua.create_function(|_, ()| -> mlua::Result<mlua::Integer> {
        let now = time::OffsetDateTime::now_utc();
        return Ok(now.unix_timestamp());
    })?;
    module.set("now", now_func)?;

    let format_func = lua.create_function(|_, (ts, fmt): (mlua::Integer, String)| -> mlua::Result<String> {
        let datetime = time::OffsetDateTime::from_unix_timestamp(ts)
            .map_err(|e| mlua::Error::external(format!("Failed to create time from timestamp: {}", e)))?;
        let format = time::format_description::parse(&fmt)
            .map_err(|e| mlua::Error::external(format!("Failed to parse format description: {}", e)))?;
        let formatted = datetime.format(&format)
            .map_err(|e| mlua::Error::external(format!("Failed to format time: {}", e)))?;
        return Ok(formatted);
    })?;
    module.set("format", format_func)?;

    let add_seconds_func = lua.create_function(|_, (ts, seconds): (mlua::Integer, mlua::Integer)| -> mlua::Result<mlua::Integer> {
        let datetime = time::OffsetDateTime::from_unix_timestamp(ts)
            .map_err(|e| mlua::Error::external(format!("Failed to create time from timestamp: {}", e)))?;
        let new_datetime = datetime + time::Duration::seconds(seconds);
        return Ok(new_datetime.unix_timestamp());
    })?;
    module.set("add_seconds", add_seconds_func)?;

    /* ========================================================================================== */

    let table_name = lua.create_string("unichat:time")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module).map_err(|e| mlua::Error::runtime(e))?;

    return Ok(mlua::Value::Table(readonly_module));
}
