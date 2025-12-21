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

    /* ========================================================================================== */

    let to_upper_func = lua.create_function(|_, s: String| {
        return Ok(s.to_uppercase());
    })?;
    module.set("to_upper", to_upper_func)?;

    let to_lower_func = lua.create_function(|_, s: String| {
        return Ok(s.to_lowercase());
    })?;
    module.set("to_lower", to_lower_func)?;

    /* ========================================================================================== */

    let strip_prefix_func = lua.create_function(|_, (s, prefix): (String, String)| {
        let result = s.strip_prefix(&prefix);

        if let Some(stripped) = result {
            return Ok(Some(stripped.to_string()));
        } else {
            return Ok(None);
        }
    })?;
    module.set("strip_prefix", strip_prefix_func)?;

    let strip_suffix_func = lua.create_function(|_, (s, suffix): (String, String)| {
        let result = s.strip_suffix(&suffix);

        if let Some(stripped) = result {
            return Ok(Some(stripped.to_string()));
        } else {
            return Ok(None);
        }
    })?;
    module.set("strip_suffix", strip_suffix_func)?;

    /* ========================================================================================== */

    let starts_with_func = lua.create_function(|_, (s, prefix): (String, String)| {
        return Ok(s.starts_with(&prefix));
    })?;
    module.set("starts_with", starts_with_func)?;

    let ends_with_func = lua.create_function(|_, (s, suffix): (String, String)| {
        return Ok(s.ends_with(&suffix));
    })?;
    module.set("ends_with", ends_with_func)?;

    /* ========================================================================================== */

    let find_func = lua.create_function(|_, (s, substring): (String, String)| {
        if let Some(index) = s.find(&substring) {
            return Ok(Some(index + 1)); // Convert to 1-based index
        } else {
            return Ok(None);
        }
    })?;
    module.set("find", find_func)?;

    let rfind_func = lua.create_function(|_, (s, substring): (String, String)| {
        if let Some(index) = s.rfind(&substring) {
            return Ok(Some(index + 1)); // Convert to 1-based index
        } else {
            return Ok(None);
        }
    })?;
    module.set("rfind", rfind_func)?;

    /* ========================================================================================== */

    let is_empty_func = lua.create_function(|_, s: String| {
        return Ok(s.is_empty());
    })?;
    module.set("is_empty", is_empty_func)?;

    /* ========================================================================================== */

    let trim_func = lua.create_function(|_, s: String| {
        return Ok(s.trim().to_string());
    })?;
    module.set("trim", trim_func)?;

    let trim_start_func = lua.create_function(|_, s: String| {
        return Ok(s.trim_start().to_string());
    })?;
    module.set("trim_start", trim_start_func)?;

    let trim_end_func = lua.create_function(|_, s: String| {
        return Ok(s.trim_end().to_string());
    })?;
    module.set("trim_end", trim_end_func)?;

    /* ========================================================================================== */

    let to_bytes_func = lua.create_function(|_, s: String| {
        return Ok(s.into_bytes());
    })?;
    module.set("to_bytes", to_bytes_func)?;

    let from_bytes_func = lua.create_function(|_, bytes: Vec<u8>| {
        match String::from_utf8(bytes) {
            Ok(s) => Ok(Some(s)),
            Err(_) => Ok(None),
        }
    })?;
    module.set("from_bytes", from_bytes_func)?;

    /* ========================================================================================== */

    let chars_func = lua.create_function(|_, s: String| {
        let chars: Vec<String> = s.chars().map(|c| c.to_string()).collect();
        return Ok(chars);
    })?;
    module.set("chars", chars_func)?;

    let length_func = lua.create_function(|_, s: String| {
        return Ok(s.chars().count());
    })?;
    module.set("length", length_func)?;

    let replace_func = lua.create_function(|_, (s, from, to, count): (String, String, String, Option<usize>)| {
        if let Some(n) = count {
            let result = s.replacen(&from, &to, n);
            return Ok(result);
        }

        let result = s.replace(&from, &to);
        return Ok(result);
    })?;
    module.set("replace", replace_func)?;

    let contains_func = lua.create_function(|_, (s, substring): (String, String)| {
        return Ok(s.contains(&substring));
    })?;
    module.set("contains", contains_func)?;

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
