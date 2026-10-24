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

use crate::plugins::instance::env::utils::from_lua_value;

/* ========================================================================== */

pub struct UniChatYamlModule;

impl UniChatYamlModule {
    pub fn new(lua: &Lua) -> Result<Value, Error> {
        let userdata = lua.create_userdata(UniChatYamlModule)?;
        return Ok(Value::UserData(userdata));
    }
}

impl UserData for UniChatYamlModule {
    fn add_methods<M: UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("encode", |lua, _this, value: Value| {
            let v: serde_json::Value = from_lua_value(lua, value)?;
            let s = serde_saphyr::to_string(&v).map_err(Error::external)?;
            return Ok(s);
        });

        methods.add_method("decode", |lua, _this, text: String| {
            let v: serde_json::Value = serde_saphyr::from_str(&text).map_err(Error::external)?;
            let lv = lua.to_value(&v)?;
            return Ok(lv);
        });
    }
}
