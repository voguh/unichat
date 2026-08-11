/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use crate::currency;

pub struct UniChatCurrencyModule;

impl UniChatCurrencyModule {
    pub fn new(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatCurrencyModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatCurrencyModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("target", |_lua, _this, ()| -> mlua::Result<Option<String>> {
            return Ok(currency::target());
        });

        methods.add_method("convert", |_lua, _this, (value, token): (f32, String)| -> mlua::Result<(Option<f32>, Option<String>)> {
            if let Some((converted, target)) = currency::convert(value, &token) {
                return Ok((Some(converted), Some(target)));
            }

            return Ok((None, None));
        });
    }
}
