/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use crate::utils::get_current_timestamp;

pub struct UniChatTimeModule;

impl UniChatTimeModule {
    pub fn new(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatTimeModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatTimeModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("now", |_lua, _this, ()| -> mlua::Result<mlua::Integer> {
            let timestamp = get_current_timestamp().map_err(mlua::Error::runtime)?;

            return Ok(timestamp);
        });
    }
}
