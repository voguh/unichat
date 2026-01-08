/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
