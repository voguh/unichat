/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

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

    let mt = lua.create_table()?;
    let newindex_func = lua.create_function(|_, (_table, _key, _value): (mlua::Value, mlua::Value, mlua::Value)| -> mlua::Result<()> {
        return Err(mlua::Error::external("unichat_time module is read-only"));
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__metatable", false)?;
    module.set_metatable(Some(mt))?;

    return Ok(mlua::Value::Table(module));
}
