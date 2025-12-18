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

    let encode_func = lua.create_function(|_, value: mlua::Value| -> mlua::Result<mlua::Integer> {
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
    module.set("parse", encode_func)?;

    let now_func = lua.create_function(|_, ()| -> mlua::Result<mlua::Integer> {
        let now = time::OffsetDateTime::now_utc();
        return Ok(now.unix_timestamp());
    })?;
    module.set("now", now_func)?;

    let table_name = lua.create_string("unichat:time")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module).map_err(|e| mlua::Error::runtime(e))?;

    return Ok(mlua::Value::Table(readonly_module));
}
