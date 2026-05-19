/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

pub fn table_deep_readonly(lua: &mlua::Lua, table_name: &mlua::Value, table: mlua::Table) -> Result<mlua::Table, mlua::Error> {
    let mt = lua.create_table()?;

    let table_name = table_name.to_string()?;
    let newindex_func = lua.create_function(move |_, _args: mlua::Variadic<mlua::Value>| -> mlua::Result<()> {
        return Err(mlua::Error::runtime(format!("Immutable table: cannot modify table '{}'", table_name)));
    })?;
    mt.set("__newindex", newindex_func)?;
    mt.set("__metatable", mlua::Value::Boolean(false))?;

    for pair in table.pairs::<mlua::Value, mlua::Value>() {
        let (key, value) = pair?;
        if let mlua::Value::Table(inner_table) = value {
            let readonly_inner_table = table_deep_readonly(lua, &key, inner_table)?;
            table.set(key, readonly_inner_table)?;
        }
    }

    table.set_metatable(Some(mt))?;

    return Ok(table);
}
