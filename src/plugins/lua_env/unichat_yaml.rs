/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

pub struct UniChatYamlModule;

impl UniChatYamlModule {
    pub fn new(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatYamlModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatYamlModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("encode", |lua, _this, value: mlua::Value| {
            let v: serde_json::Value = lua.from_value(value)?;
            let s = serde_saphyr::to_string(&v).map_err(mlua::Error::external)?;
            return Ok(s);
        });

        methods.add_method("decode", |lua, _this, text: String| {
            let v: serde_json::Value = serde_saphyr::from_str(&text).map_err(mlua::Error::external)?;
            let lv = lua.to_value(&v)?;
            return Ok(lv);
        });
    }
}
