/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

pub struct UniChatJsonModule;

impl UniChatJsonModule {
    pub fn new (lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatJsonModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatJsonModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("encode", |lua, _this, value: mlua::Value| {
            let v: serde_json::Value = lua.from_value(value)?;
            let s = serde_json::to_string(&v).map_err(mlua::Error::external)?;
            return Ok(s);
        });

        methods.add_method("decode", |lua, _this, text: String| {
            let v: serde_json::Value = serde_json::from_str(&text).map_err(mlua::Error::external)?;
            let lv = lua.to_value(&v)?;
            return Ok(lv);
        });
    }
}
