/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::io::Write as _;
use std::sync::Arc;

use mlua::LuaSerdeExt as _;

use crate::CARGO_PKG_VERSION;
use crate::error::Error;
use crate::events;
use crate::plugins::get_app_handle;
use crate::plugins::get_plugin;
use crate::plugins::get_lua_runtime;
use crate::plugins::lua_env::SHARED_MODULES;
use crate::plugins::lua_env::unichat_event::LuaUniChatEvent;
use crate::scrapper;
use crate::scrapper::UniChatScrapper;
use crate::shared_emotes;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::render_emitter;
use crate::utils::safe_guard_path;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

/* ================================================================================================================== */

fn get_optional_table_property<R: mlua::FromLua>(table: &mlua::Table, keys: Vec<&str>) -> Result<Option<R>, mlua::Error> {
    for key in keys {
        if let Ok(value) = table.get(key) {
            return Ok(Some(value));
        }
    }

    return Ok(None);
}

fn get_table_property<R: mlua::FromLua>(table: &mlua::Table, default_value: Option<R>, keys: Vec<&str>) -> Result<R, mlua::Error> {
    let first = keys.first().copied().unwrap_or("unknown");

    if let Some(value) = get_optional_table_property::<R>(table, keys)? {
        return Ok(value);
    } else if let Some(default_value) = default_value {
        return Ok(default_value);
    }

    return Err(mlua::Error::runtime(format!("Missing required property '{}' in scrapper options table", first)));
}

struct LuaUniChatScrapper {
    id: String,
    name: String,
    editing_tooltip_message: String,
    editing_tooltip_urls: Vec<String>,
    placeholder_text: String,
    badges: Vec<String>,
    icon: String,
    validate_url: mlua::Function,
    scrapper_js: String,
    on_event: mlua::Function,
    on_ready: Option<mlua::Function>,
    on_ping: Option<mlua::Function>,
    on_error: Option<mlua::Function>
}

impl LuaUniChatScrapper {
    fn new(id: String, name: String, scrapper_js: String, opts: mlua::Table) -> Result<Self, mlua::Error> {
        let editing_tooltip_message = get_table_property(&opts, Some(format!("Enter {} chat url...", name)), vec!["editingTooltipMessage", "editing_tooltip_message"])?;
        let editing_tooltip_urls = get_table_property(&opts, Some(Vec::new()), vec!["editingTooltipUrls", "editing_tooltip_urls"])?;
        let placeholder_text = get_table_property(&opts, Some(format!("Enter {} chat url...", name)), vec!["placeholderText", "placeholder_text"])?;
        let badges = get_table_property(&opts, Some(Vec::new()), vec!["badges"])?;
        let icon = get_table_property(&opts, Some(String::from("fas fa-video")), vec!["icon"])?;
        let validate_url = get_table_property(&opts, None, vec!["validateUrl", "validate_url"])?;
        let on_event = get_table_property(&opts, None, vec!["onEvent", "on_event"])?;
        let on_ready = get_optional_table_property(&opts, vec!["onReady", "on_ready"])?;
        let on_ping = get_optional_table_property(&opts, vec!["onPing", "on_ping"])?;
        let on_error = get_optional_table_property(&opts, vec!["onError", "on_error"])?;

        if id.trim().is_empty() || !id.trim().ends_with("-chat") {
            return Err(mlua::Error::runtime("Scrapper 'id' must be a non-empty string and end with '-chat'"));
        }

        if name.trim().is_empty() {
            return Err(mlua::Error::runtime("Scrapper 'name' must be a non-empty string"));
        }

        return Ok(Self {
            id: id,
            name: name,
            editing_tooltip_message: editing_tooltip_message,
            editing_tooltip_urls: editing_tooltip_urls,
            placeholder_text: placeholder_text,
            badges: badges,
            icon: icon,
            validate_url: validate_url,
            scrapper_js: scrapper_js,
            on_event: on_event,
            on_ready: on_ready,
            on_ping: on_ping,
            on_error: on_error
        });
    }

    fn log_action(&self, file_name: &str, content: &impl std::fmt::Display) {
        let app_log_dir = properties::get_app_path(AppPaths::AppLog);
        let scrapper_log_dir = app_log_dir.join(&self.id);
        if !scrapper_log_dir.exists() {
            fs::create_dir_all(&scrapper_log_dir).unwrap()
        }

        let log_file = scrapper_log_dir.join(file_name);
        let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
        writeln!(file, "{content}").unwrap();
    }
}

impl UniChatScrapper for LuaUniChatScrapper {
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
        let result: String = self.validate_url.call(url)?;
        return Ok(result);
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let scrapper_id = event.get("scrapperId").and_then(|v| v.as_str())
            .ok_or(format!("Missing or invalid 'scrapperId' field in {} raw event payload", self.id))?;
        let event_type = event.get("type").and_then(|v| v.as_str())
            .ok_or(format!("Missing or invalid 'type' field in {} raw event payload", self.id))?;

        if scrapper_id != self.id {
            return Ok(());
        }

        if matches!(event_type, "ready" | "ping" | "error") {
            if let Err(err) = render_emitter::emit(event.clone()) {
                log::error!("{:?}", err);
            }

            if event_type == "ready" {
                if let Some(on_ready) = &self.on_ready {
                    let lua = get_lua_runtime()?;

                    let table = lua.to_value(&event)?;
                    if let Err(err) = on_ready.call::<()>(table) {
                        log::error!("An error occurred on '{}' scrapper 'on_ready' callback: {}", self.id, err);
                    }
                }
            } else if event_type == "ping" {
                if let Some(on_ping) = &self.on_ping {
                    let lua = get_lua_runtime()?;

                    let table = lua.to_value(&event)?;
                    if let Err(err) = on_ping.call::<()>(table) {
                        log::error!("An error occurred on '{}' scrapper 'on_ping' callback: {}", self.id, err);
                    }
                }
            } else if event_type == "error" {
                if let Some(on_error) = &self.on_error {
                    let lua = get_lua_runtime()?;

                    let table = lua.to_value(&event)?;
                    if let Err(err) = on_error.call::<()>(table) {
                        log::error!("An error occurred on '{}' scrapper 'on_error' callback: {}", self.id, err);
                    }
                }
            }
        } else {
            let lua = get_lua_runtime()?;
            let log_events = settings::get_scrapper_property(&self.id, "log_level").unwrap_or(SettingLogEventLevel::OnlyErrors);

            if is_dev() || log_events == SettingLogEventLevel::AllEvents {
                self.log_action("events-raw.log", &event);
            }

            let table = lua.to_value(&event)?;

            match self.on_event.call::<Option<LuaUniChatEvent>>(table) {
                Ok(Some(event)) => {
                    let parsed = event.inner;
                    if is_dev() || log_events == SettingLogEventLevel::AllEvents {
                        let str = serde_json::to_string(&parsed)?;
                        self.log_action("events-parsed.log", &str);
                    }

                    if let Err(err) = events::emit(parsed) {
                        log::error!("An error occurred on send unichat event: {}", err);
                    }
                },
                Ok(None) => {
                    if is_dev() || [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                        self.log_action("events-unknown.log", &event);
                    }
                },
                Err(err) => {
                    log::error!("An error occurred on '{}' scrapper 'on_event' callback: {}", self.id, err);
                    self.log_action("events-error.log", &format!("{} -- {:?}", err, event));
                }
            }
        }

        return Ok(());
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
    pub fn new(plugin_name: &str) -> Self {
        return Self { plugin_name: plugin_name.to_string() };
    }
}

impl mlua::UserData for UniChatAPI {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get_version", |_lua, _this, ()| {
            return Ok(CARGO_PKG_VERSION.to_string());
        });

        methods.add_method("register_scrapper", |_lua, this, (id, name, scrapper_js_path, opts): (String, String, String, mlua::Table)| {
            let app_handle = get_app_handle()?;
            let plugin = get_plugin(&this.plugin_name)?;

            let scrapper_js_path = safe_guard_path(&plugin.get_plugin_data_path(), &scrapper_js_path).map_err(mlua::Error::runtime)?;
            let scrapper_js_content = fs::read_to_string(scrapper_js_path).map_err(mlua::Error::external)?;
            let scrapper = LuaUniChatScrapper::new(id, name, scrapper_js_content, opts)?;

            let scrapper: Arc<dyn UniChatScrapper + Send + Sync> = Arc::new(scrapper);
            let scrapper_id = scrapper.id().to_string();
            scrapper::register_scrapper(&app_handle, scrapper).map_err(mlua::Error::runtime)?;
            plugin.add_message(format!("Registered scrapper '{}'.", scrapper_id));

            return Ok(());
        });

        methods.add_method("fetch_shared_emotes", |_lua, _this, (platform, channel_id): (String, String)| {
            shared_emotes::fetch_shared_emotes(&platform, &channel_id).map_err(mlua::Error::runtime)?;
            return Ok(());
        });

        methods.add_method("expose_module", |_lua, this, (module_name, module_table): (String, mlua::Value)| {
            let plugin = get_plugin(&this.plugin_name)?;
            let plugin_name = this.plugin_name.clone();
            let key = format!("{}:{}", plugin_name, module_name);

            let mut shared_modules = SHARED_MODULES.write().map_err(mlua::Error::runtime)?;
            if shared_modules.contains_key(&key) {
                return Err(mlua::Error::runtime(format!("Module '{}' is already exposed by plugin '{}'", module_name, plugin_name)));
            }

            let key_to_print = key.clone();
            shared_modules.insert(key, Arc::new(module_table));
            plugin.add_message(format!("Exposed shared module '{}'.", key_to_print));

            return Ok(());
        });
    }
}
