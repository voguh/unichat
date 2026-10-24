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
use mlua::Integer;
use mlua::Lua;
use mlua::UserData;
use mlua::UserDataMethods;
use mlua::Value;

use crate::utils::get_current_timestamp;

/* ========================================================================== */

pub struct UniChatTimeModule;

impl UniChatTimeModule {
    pub fn new(lua: &Lua) -> Result<Value, Error> {
        let userdata = lua.create_userdata(UniChatTimeModule)?;
        return Ok(Value::UserData(userdata));
    }
}

impl UserData for UniChatTimeModule {
    fn add_methods<M: UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("now", |_lua, _this, ()| -> mlua::Result<Integer> {
            let timestamp = get_current_timestamp();

            return Ok(timestamp);
        });
    }
}
