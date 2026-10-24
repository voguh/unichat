/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::Lua;
use mlua::Result;
use mlua::UserData;
use mlua::UserDataMethods;
use mlua::Value;

use crate::currency;

/* ========================================================================== */

pub struct UniChatCurrencyModule;

impl UniChatCurrencyModule {
    pub fn new(lua: &Lua) -> Result<Value> {
        let userdata = lua.create_userdata(UniChatCurrencyModule)?;
        return Ok(Value::UserData(userdata));
    }
}

impl UserData for UniChatCurrencyModule {
    fn add_methods<M: UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("target", |_lua, _this, ()| -> Result<Option<String>> {
            return Ok(currency::target_currency().map(|currency| currency.code));
        });

        methods.add_method(
            "convert",
            |_lua, _this, (value, token): (f64, String)| -> Result<(Option<f64>, Option<String>)> {
                if let Some((converted, target)) = currency::convert(value, &token) {
                    return Ok((Some(converted), Some(target)));
                }

                return Ok((None, None));
            }
        );
    }
}
