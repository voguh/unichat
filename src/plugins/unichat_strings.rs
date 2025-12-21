/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::plugins::utils::table_deep_readonly;

pub fn create_module(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
    let module = lua.create_table()?;

    let strip_prefix_func = lua.create_function(|_, (s, prefix): (String, String)| {
        let result = s.strip_prefix(&prefix);

        if let Some(stripped) = result {
            return Ok(Some(stripped.to_string()));
        } else {
            return Ok(None);
        }
    })?;
    module.set("strip_prefix", strip_prefix_func)?;

    let trim_func = lua.create_function(|_, s: String| {
        return Ok(s.trim().to_string());
    })?;
    module.set("trim", trim_func)?;

    let starts_with_func = lua.create_function(|_, (s, prefix): (String, String)| {
        return Ok(s.starts_with(&prefix));
    })?;
    module.set("starts_with", starts_with_func)?;

    let split_func = lua.create_function(|_, (s, delimiter): (String, String)| {
        let parts: Vec<String> = s.split(&delimiter).map(|part| part.to_string()).collect();
        return Ok(parts);
    })?;
    module.set("split", split_func)?;

    /* ========================================================================================== */

    let table_name = lua.create_string("unichat:strings")?;
    let table_name = mlua::Value::String(table_name);
    let readonly_module = table_deep_readonly(lua, &table_name, module).map_err(|e| mlua::Error::runtime(e))?;

    return Ok(mlua::Value::Table(readonly_module));
}
