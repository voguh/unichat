/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

pub fn create_module(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
    let module = lua.create_table()?;

    let encode_func = lua.create_function(|lua, value: mlua::Value| {
        let v: serde_json::Value = lua.from_value(value)?;
        let s = serde_json::to_string(&v).map_err(mlua::Error::external)?;
        return Ok(s);
    })?;

    let decode_func = lua.create_function(|lua, text: String| {
        let v: serde_json::Value = serde_json::from_str(&text).map_err(mlua::Error::external)?;
        let lv = lua.to_value(&v)?;
        return Ok(lv);
    })?;

    module.set("encode", encode_func)?;
    module.set("decode", decode_func)?;

    let mt = lua.create_table()?;
    let newindex_func = lua.create_function(|_, (_table, _key, _value): (mlua::Value, mlua::Value, mlua::Value)| -> mlua::Result<()> {
        return Err(mlua::Error::external("unichat_logger module is read-only"));
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__metatable", false)?;
    module.set_metatable(Some(mt))?;

    return Ok(mlua::Value::Table(module));
}
