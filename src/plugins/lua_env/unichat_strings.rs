/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

pub struct UniChatStringsModule;

impl UniChatStringsModule {
    pub fn new(lua: &mlua::Lua) -> Result<mlua::Value, mlua::Error> {
        let userdata = lua.create_userdata(UniChatStringsModule)?;
        return Ok(mlua::Value::UserData(userdata));
    }
}

impl mlua::UserData for UniChatStringsModule {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {

        methods.add_method("to_upper", |_lua, _this, s: String| {
            return Ok(s.to_uppercase());
        });

        methods.add_method("to_lower", |_lua, _this, s: String| {
            return Ok(s.to_lowercase());
        });

        /* ========================================================================================== */

        methods.add_method("strip_prefix", |_lua, _this, (s, prefix): (String, String)| {
            let result = s.strip_prefix(&prefix);

            if let Some(stripped) = result {
                return Ok(Some(stripped.to_string()));
            } else {
                return Ok(None);
            }
        });

        methods.add_method("strip_suffix", |_lua, _this, (s, suffix): (String, String)| {
            let result = s.strip_suffix(&suffix);

            if let Some(stripped) = result {
                return Ok(Some(stripped.to_string()));
            } else {
                return Ok(None);
            }
        });

        /* ========================================================================================== */

        methods.add_method("starts_with", |_lua, _this, (s, prefix): (String, String)| {
            return Ok(s.starts_with(&prefix));
        });

        methods.add_method("ends_with", |_lua, _this, (s, suffix): (String, String)| {
            return Ok(s.ends_with(&suffix));
        });

        /* ========================================================================================== */

        methods.add_method("find", |_lua, _this, (s, substring): (String, String)| {
            if let Some(index) = s.find(&substring) {
                return Ok(Some(index + 1)); // Convert to 1-based index
            } else {
                return Ok(None);
            }
        });

        methods.add_method("rfind", |_lua, _this, (s, substring): (String, String)| {
            if let Some(index) = s.rfind(&substring) {
                return Ok(Some(index + 1)); // Convert to 1-based index
            } else {
                return Ok(None);
            }
        });

        /* ========================================================================================== */

        methods.add_method("is_empty", |_lua, _this, s: String| {
            return Ok(s.is_empty());
        });

        /* ========================================================================================== */

        methods.add_method("trim", |_lua, _this, s: String| {
            return Ok(s.trim().to_string());
        });

        methods.add_method("trim_start", |_lua, _this, s: String| {
            return Ok(s.trim_start().to_string());
        });

        methods.add_method("trim_end", |_lua, _this, s: String| {
            return Ok(s.trim_end().to_string());
        });

        /* ========================================================================================== */

        methods.add_method("to_bytes", |_lua, _this, s: String| {
            return Ok(s.into_bytes());
        });

        methods.add_method("from_bytes", |_lua, _this, bytes: Vec<u8>| {
            return String::from_utf8(bytes).map_err(mlua::Error::external);
        });

        /* ========================================================================================== */

        methods.add_method("chars", |_lua, _this, s: String| {
            let chars: Vec<String> = s.chars().map(|c| c.to_string()).collect();
            return Ok(chars);
        });

        methods.add_method("length", |_lua, _this, s: String| {
            return Ok(s.chars().count());
        });

        methods.add_method("replace", |_lua, _this, (s, from, to, count): (String, String, String, Option<usize>)| {
            if let Some(n) = count {
                let result = s.replacen(&from, &to, n);
                return Ok(result);
            }

            let result = s.replace(&from, &to);
            return Ok(result);
        });

        methods.add_method("contains", |_lua, _this, (s, substring): (String, String)| {
            return Ok(s.contains(&substring));
        });

        methods.add_method("split", |_lua, _this, (s, delimiter): (String, String)| {
            let parts: Vec<String> = s.split(&delimiter).map(|part| part.to_string()).collect();
            return Ok(parts);
        });
    }
}
