/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::plugins::utils::table_deep_readonly;
use crate::utils::get_current_timestamp;

pub fn create_module(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
    let module = lua.create_table()?;

    let now_func = lua.create_function(|_, ()| -> mlua::Result<mlua::Integer> {
        let timestamp = get_current_timestamp().map_err(mlua::Error::runtime)?;

        return Ok(timestamp);
    })?;
    module.set("now", now_func)?;

    /* ========================================================================================== */

    let table_name = lua.create_string("unichat:time")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module).map_err(mlua::Error::runtime)?;

    return Ok(mlua::Value::Table(readonly_module));
}
