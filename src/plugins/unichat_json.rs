/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

use crate::plugins::utils::table_deep_readonly;

pub fn create_module(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
    let module = lua.create_table()?;

    let encode_func = lua.create_function(|lua, value: mlua::Value| {
        let v: serde_json::Value = lua.from_value(value)?;
        let s = serde_json::to_string(&v).map_err(mlua::Error::external)?;
        return Ok(s);
    })?;
    module.set("encode", encode_func)?;

    let decode_func = lua.create_function(|lua, text: String| {
        let v: serde_json::Value = serde_json::from_str(&text).map_err(mlua::Error::external)?;
        let lv = lua.to_value(&v)?;
        return Ok(lv);
    })?;
    module.set("decode", decode_func)?;

    let table_name = lua.create_string("unichat:json")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module).map_err(|e| mlua::Error::runtime(e))?;

    return Ok(mlua::Value::Table(readonly_module));
}
