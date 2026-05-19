/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::io::Write as _;

use anyhow::anyhow;
use anyhow::Error;
use mlua::LuaSerdeExt as _;

use crate::events;
use crate::plugins::instance::env::unichat_event::LuaUniChatEvent;
use crate::plugins::runtime;
use crate::scraper::UniChatScraper;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

fn get_optional_table_property<R: mlua::FromLua>(table: &mlua::Table, key: &str) -> Result<Option<R>, mlua::Error> {
    if let Ok(value) = table.get(key) {
        return Ok(Some(value));
    }

    return Ok(None);
}

fn get_table_property<R: mlua::FromLua>(table: &mlua::Table, key: &str, default_value: Option<R>) -> Result<R, mlua::Error> {
    if let Some(value) = get_optional_table_property::<R>(table, key)? {
        return Ok(value);
    } else if let Some(default_value) = default_value {
        return Ok(default_value);
    }

    return Err(mlua::Error::external(format!("Missing required table property '{}'", key)));
}

pub struct LuaUniChatScraper {
    id: String,
    name: String,
    editing_tooltip_message: String,
    editing_tooltip_urls: Vec<String>,
    placeholder_text: String,
    badges: Vec<String>,
    icon: String,
    validate_url: mlua::Function,
    scraper_js: String,
    on_event: mlua::Function,
    on_idle: Option<mlua::Function>,
    on_ready: Option<mlua::Function>,
    on_ping: Option<mlua::Function>,
    on_error: Option<mlua::Function>
}

impl LuaUniChatScraper {
    pub fn new(id: String, name: String, scraper_js: String, on_event: mlua::Function, opts: mlua::Table) -> Result<Self, mlua::Error> {
        let editing_tooltip_message = get_table_property(&opts, "editing_tooltip_message", Some(format!("Enter {} chat url...", name)))?;
        let editing_tooltip_urls = get_table_property(&opts, "editing_tooltip_urls", Some(Vec::new()))?;
        let placeholder_text = get_table_property(&opts, "placeholder_text", Some(format!("Enter {} chat url...", name)))?;
        let badges = get_table_property(&opts, "badges", Some(Vec::new()))?;
        let icon = get_table_property(&opts, "icon", Some(String::from("fas fa-video")))?;
        let validate_url = get_table_property(&opts, "validate_url", None)?;
        let on_idle = get_optional_table_property(&opts, "on_idle")?;
        let on_ready = get_optional_table_property(&opts, "on_ready")?;
        let on_ping = get_optional_table_property(&opts, "on_ping")?;
        let on_error = get_optional_table_property(&opts, "on_error")?;

        if id.trim().is_empty() || id.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') || !id.trim().ends_with("-chat") {
            return Err(mlua::Error::external(format!("Scraper 'id' must be a non-empty alphanumeric ASCII string and end with '-chat'")));
        }

        if name.trim().is_empty() {
            return Err(mlua::Error::external(format!("Scraper 'name' must be a non-empty string")));
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
            scraper_js: scraper_js,
            on_event: on_event,
            on_idle: on_idle,
            on_ready: on_ready,
            on_ping: on_ping,
            on_error: on_error
        });
    }

    fn log_action(&self, file_name: &str, content: &impl std::fmt::Display) {
        let app_log_dir = properties::get_app_path(AppPaths::AppLog);
        let scraper_log_dir = app_log_dir.join(&self.id);
        if !scraper_log_dir.exists() {
            fs::create_dir_all(&scraper_log_dir).unwrap()
        }

        let log_file = scraper_log_dir.join(file_name);
        let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
        writeln!(file, "{content}").unwrap();
    }
}

impl UniChatScraper for LuaUniChatScraper {
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
        let scraper_id = event.get("scraperId").and_then(|v| v.as_str())
            .ok_or(anyhow!("Missing or invalid 'scraperId' field in {} raw event payload", self.id))?;
        let event_type = event.get("type").and_then(|v| v.as_str())
            .ok_or(anyhow!("Missing or invalid 'type' field in {} raw event payload", self.id))?;

        if scraper_id != self.id {
            return Ok(());
        }

        let lua = runtime::get()?;
        if matches!(event_type, "idle" | "ready" | "ping" | "error") {
            if let Err(err) = render_emitter::emit(event.clone()) {
                log::error!("{:?}", err);
            }

            let table = lua.to_value(&event)?;

            if event_type == "idle" {
                if let Some(on_idle) = &self.on_idle {
                    if let Err(err) = on_idle.call::<()>(table) {
                        log::error!("An error occurred on '{}' scraper 'on_idle' callback: {}", self.id, err);
                    }
                }
            } else if event_type == "ready" {
                if let Some(on_ready) = &self.on_ready {
                    if let Err(err) = on_ready.call::<()>(table) {
                        log::error!("An error occurred on '{}' scraper 'on_ready' callback: {}", self.id, err);
                    }
                }
            } else if event_type == "ping" {
                if let Some(on_ping) = &self.on_ping {
                    if let Err(err) = on_ping.call::<()>(table) {
                        log::error!("An error occurred on '{}' scraper 'on_ping' callback: {}", self.id, err);
                    }
                }
            } else if event_type == "error" {
                if let Some(on_error) = &self.on_error {
                    if let Err(err) = on_error.call::<()>(table) {
                        log::error!("An error occurred on '{}' scraper 'on_error' callback: {}", self.id, err);
                    }
                }
            }
        } else {
            let log_events = settings::get_scraper_events_log_level();

            if log_events == SettingLogEventLevel::AllEvents {
                self.log_action("events-raw.log", &event);
            }

            let table = lua.to_value(&event)?;

            match self.on_event.call::<Option<LuaUniChatEvent>>(table) {
                Ok(Some(event)) => {
                    let parsed = event.inner;
                    if log_events == SettingLogEventLevel::AllEvents {
                        let str = serde_json::to_string(&parsed)?;
                        self.log_action("events-parsed.log", &str);
                    }

                    if let Err(err) = events::emit(parsed) {
                        log::error!("An error occurred on send unichat event: {}", err);
                    }
                },
                Ok(None) => {
                    if [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                        self.log_action("events-unknown.log", &event);
                    }
                },
                Err(err) => {
                    log::error!("An error occurred on '{}' scraper 'on_event' callback: {}", self.id, err);
                    self.log_action("events-error.log", &format!("{} -- {:?}", err, event));
                }
            }
        }

        return Ok(());
    }

    fn scraper_js(&self) -> &str {
        return &self.scraper_js;
    }
}
