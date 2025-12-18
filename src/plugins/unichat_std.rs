/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::sync::Arc;

use mlua::LuaSerdeExt as _;

use crate::CARGO_PKG_VERSION;
use crate::error::Error;
use crate::events;
use crate::plugins::get_app_handle;
use crate::plugins::get_loaded_plugin_manifest;
use crate::plugins::get_lua_runtime;
use crate::plugins::unichat_event::LuaUniChatEvent;
use crate::scrapper;
use crate::scrapper::UniChatScrapper;
use crate::utils::render_emitter;

fn get_property_from_table<R: mlua::FromLua>(table: &mlua::Table, k1: &str, k2: Option<&'static str>, default_value: Option<R>) -> Result<R, mlua::Error> {
    if let Ok(v1) = table.get(k1) {
        return Ok(v1);
    } else if let Some(k2) = k2 {
        if let Ok(v2) = table.get(k2) {
            return Ok(v2);
        }
    }

    if let Some(default_value) = default_value {
        return Ok(default_value);
    }

    return Err(mlua::Error::runtime(format!("Table is missing '{}' field", k1)));
}

pub struct UniChatScrapperLua {
    table: mlua::Table,

    id: String,
    name: String,
    editing_tooltip_message: String,
    editing_tooltip_urls: Vec<String>,
    placeholder_text: String,
    badges: Vec<String>,
    icon: String,
    validate_url: mlua::Function,
    on_event: mlua::Function,
    scrapper_js: String
}

impl UniChatScrapperLua {
    pub fn new(table: mlua::Table, scrapper_js: String) -> Result<Self, mlua::Error> {
        let id: String = get_property_from_table(&table, "id", None, None)?;
        let name: String = get_property_from_table(&table, "name", None, None)?;
        let editing_tooltip_message: String = get_property_from_table(&table, "editingTooltipMessage", Some("editing_tooltip_message"), Some(format!("You can enter one of the following URLs to get the {} chat:", name)))?;
        let editing_tooltip_urls: Vec<String> = get_property_from_table(&table, "editingTooltipUrls", Some("editing_tooltip_urls"), Some(Vec::new()))?;
        let placeholder_text: String = get_property_from_table(&table, "placeholderText", Some("placeholder_text"), Some(format!("Enter {} chat url...", name)))?;
        let badges: Vec<String> = get_property_from_table(&table, "badges", None, Some(Vec::new()))?;
        let icon: String = get_property_from_table(&table, "icon", None, Some(String::from("fas fa-video")))?;
        let validate_url: mlua::Function = get_property_from_table(&table, "validateUrl", Some("validate_url"), None)?;
        let on_event: mlua::Function = get_property_from_table(&table, "onEvent", Some("on_event"), None)?;

        return Ok(Self {
            table: table,

            id: id,
            name: name,
            editing_tooltip_message: editing_tooltip_message,
            editing_tooltip_urls: editing_tooltip_urls,
            placeholder_text: placeholder_text,
            badges: badges,
            icon: icon,
            validate_url: validate_url,
            on_event: on_event,
            scrapper_js: scrapper_js
        });
    }
}

impl UniChatScrapper for UniChatScrapperLua {
    fn id(&self) -> &str {
        return &self.id;
    }

    fn name(&self) -> &str {
        return &self.name;
    }

    fn editing_tooltip_message(&self) -> &str {
        return &self.editing_tooltip_message;
    }

    fn editing_tooltip_urls(&self) -> &[String] {
        return &self.editing_tooltip_urls;
    }

    fn placeholder_text(&self) -> &str {
        return &self.placeholder_text;
    }

    fn badges(&self) -> &[String] {
        return &self.badges;
    }

    fn icon(&self) -> &str {
        return &self.icon;
    }

    fn validate_url(&self, url: String) -> Result<String, Error> {
        let result = self.validate_url.call(url)?;
        return Ok(result);
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let lua = get_lua_runtime()?;
        let table = lua.to_value(&event)?;
        let result = self.on_event.call(table)?;
        return Ok(result)
    }

    fn scrapper_js(&self) -> &str {
        return &self.scrapper_js;
    }
}

/* ================================================================================================================== */

pub struct UniChatAPI {
    plugin_name: String
}

impl UniChatAPI {
    pub fn new(plugin_name: String) -> Self {
        return Self { plugin_name };
    }
}

impl mlua::UserData for UniChatAPI {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get_version", |_lua, _this, ()| {
            return Ok(CARGO_PKG_VERSION.to_string());
        });

        methods.add_method("register_scrapper", |_lua, this, scrapper: mlua::Table| {
            let app_handle = get_app_handle()?;
            let manifest = get_loaded_plugin_manifest(&this.plugin_name)?;

            let scrapper_js_path: String = scrapper.get("scrapper_js_path")?;
            let scrapper_js_path = manifest.plugin_path.join("data").join(scrapper_js_path);
            let scrapper_js_content = fs::read_to_string(scrapper_js_path).map_err(|e| mlua::Error::external(e))?;
            let scrapper = UniChatScrapperLua::new(scrapper, scrapper_js_content)?;

            let scrapper: Arc<dyn UniChatScrapper + Send + Sync> = Arc::new(scrapper);
            scrapper::register_scrapper(&app_handle, scrapper).map_err(|e| mlua::Error::runtime(e))?;

            return Ok(());
        });

        methods.add_method("emit_status_event", |lua, _this, payload: mlua::Value| {
            let value: serde_json::Value = lua.from_value(payload)?;
            render_emitter::emit(value).map_err(|e| mlua::Error::runtime(e))?;
            return Ok(());
        });

        methods.add_method("emit_unichat_event", |_lua, _this, payload: mlua::AnyUserData| {
            let payload = payload.borrow::<LuaUniChatEvent>()?;
            let value = payload.inner.clone();
            events::emit(value).map_err(|e| mlua::Error::runtime(e))?;
            return Ok(());
        });
    }
}
