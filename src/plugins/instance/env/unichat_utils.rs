/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use crate::utils::random_color_by_seed;

pub struct UniChatUtilsModule;

impl UniChatUtilsModule {
    pub fn new(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatUtilsModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatUtilsModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("random_color_by_seed", |_lua, _this, seed: String| -> mlua::Result<String> {
            let color = random_color_by_seed(&seed).map_err(mlua::Error::runtime)?;
            return Ok(color);
        });
    }
}
