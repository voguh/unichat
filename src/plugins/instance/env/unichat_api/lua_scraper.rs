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
use std::io::Write;

use mlua::Error;
use mlua::FromLua;
use mlua::Function;
use mlua::LuaSerdeExt;
use mlua::Table;
use mlua::Value;
use serde::Deserialize;

use crate::events;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::plugins::instance::env::utils::from_lua_value;
use crate::plugins::runtime;
use crate::scraper::UniChatScraper;
use crate::scraper::status::ScraperStatus;
use crate::scraper::status::ScraperStatusEvent;
use crate::settings;
use crate::settings::SettingLogEventLevel;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

/* ========================================================================== */

fn get_optional_table_property<R: FromLua>(table: &Table, key: &str) -> Option<R> {
    return table.get(key).ok();
}

fn get_table_property<R: FromLua>(table: &Table, key: &str, default_value: Option<R>) -> Result<R, Error> {
    if let Some(value) = get_optional_table_property(table, key) {
        return Ok(value);
    } else if let Some(default_value) = default_value {
        return Ok(default_value);
    }

    return Err(Error::external(format!("Missing required table property '{}'", key)));
}

pub struct LuaUniChatScraper {
    id: String,
    name: String,
    editing_tooltip_message: String,
    editing_tooltip_urls: Vec<String>,
    placeholder_text: String,
    badges: Vec<String>,
    icon: String,
    validate_url: Function,
    scraper_js: String,
    on_event: Function,
    on_idle: Option<Function>,
    on_ready: Option<Function>,
    on_ping: Option<Function>,
    on_error: Option<Function>,
    on_fatal: Option<Function>
}

impl LuaUniChatScraper {
    pub fn new(id: String, name: String, scraper_js: String, on_event: Function, opts: Table) -> Result<Self, Error> {
        let default_text = format!("Enter {} chat url...", name);
        let editing_tooltip_message = get_table_property(&opts, "editing_tooltip_message", Some(default_text.clone()))?;
        let editing_tooltip_urls = get_table_property(&opts, "editing_tooltip_urls", Some(Vec::new()))?;
        let placeholder_text = get_table_property(&opts, "placeholder_text", Some(default_text))?;
        let badges = get_table_property(&opts, "badges", Some(Vec::new()))?;
        let icon = get_table_property(&opts, "icon", Some(String::from("fas fa-video")))?;
        let validate_url = get_table_property(&opts, "validate_url", None)?;
        let on_idle = get_optional_table_property(&opts, "on_idle");
        let on_ready = get_optional_table_property(&opts, "on_ready");
        let on_ping = get_optional_table_property(&opts, "on_ping");
        let on_error = get_optional_table_property(&opts, "on_error");
        let on_fatal = get_optional_table_property(&opts, "on_fatal");

        if id.trim().is_empty()
            || id.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-')
            || !id.trim().ends_with("-chat")
        {
            return Err(Error::external(format!("Invalid scraper ID '{}'", id)));
        }

        if name.trim().is_empty() {
            return Err(Error::external("Empty scraper name"));
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
            on_error: on_error,
            on_fatal: on_fatal
        });
    }

    fn log_action(&self, file_name: &str, content: &impl std::fmt::Display) {
        let app_log_dir = properties::get_app_path(AppPaths::AppLog);
        let scraper_log_dir = app_log_dir.join(&self.id);
        if !scraper_log_dir.exists() {
            fs::create_dir_all(&scraper_log_dir).expect("Failed to create scraper log directory")
        }

        let log_file = scraper_log_dir.join(file_name);
        let mut options = fs::OpenOptions::new();
        options.create(true).append(true);
        let mut file = options.open(log_file).expect("Failed to open scraper log file");
        writeln!(file, "{content}").expect("Failed to write scraper log file");
    }

    fn status_callback(&self, status: ScraperStatus) -> Option<&Function> {
        return match status {
            ScraperStatus::Idle => self.on_idle.as_ref(),
            ScraperStatus::Ready => self.on_ready.as_ref(),
            ScraperStatus::Ping => self.on_ping.as_ref(),
            ScraperStatus::Error => self.on_error.as_ref(),
            ScraperStatus::Fatal => self.on_fatal.as_ref()
        };
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

    fn validate_url(&self, url: String) -> Result<String, anyhow::Error> {
        let result: String = self.validate_url.call(url)?;
        return Ok(result);
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), anyhow::Error> {
        let lua = runtime::get();
        let log_events = settings::get_scraper_events_log_level();

        if log_events == SettingLogEventLevel::AllEvents {
            self.log_action("events-raw.log", &event);
        }

        let table = lua.to_value(&event)?;

        match self.on_event.call::<Option<Value>>(table) {
            Ok(Some(parsed_event)) => {
                let json: serde_json::Value = from_lua_value(lua, parsed_event)?;

                let event_type = json.get("type").and_then(|v| v.as_str()).unwrap_or_default();
                if event_type == "unichat:userstore_update" {
                    log::warn!(target: &format!("scraper:{}", self.name), "Event 'unichat:userstore_update' is not allowed");
                    return Ok(());
                }

                if event_type != "unichat:custom" {
                    let raw_platform = json.pointer("/data/platform");
                    let platform = raw_platform.and_then(|v| UniChatPlatform::deserialize(v).ok());
                    if let Some(platform) = &platform {
                        if !matches!(platform, UniChatPlatform::Other(_)) {
                            log::warn!(target: &format!("scraper:{}", self.name), "Event '{}' with reserved platform {:?} is not allowed", event_type, platform);
                            return Ok(());
                        }
                    } else {
                        log::warn!(target: &format!("scraper:{}", self.name), "Event '{}' without platform is not allowed", event_type);
                        return Ok(());
                    }
                }

                let parsed: UniChatEvent = serde_json::from_value(json)?;

                if log_events == SettingLogEventLevel::AllEvents {
                    let str = serde_json::to_string(&parsed)?;
                    self.log_action("events-parsed.log", &str);
                }

                if let Err(err) = events::emit(parsed) {
                    log::error!(target: &format!("scraper:{}", self.name), "An error occurred on send unichat event: {:#?}", err);
                }
            }
            Ok(None) => {
                if [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                    self.log_action("events-unknown.log", &event);
                }
            }
            Err(err) => {
                log::error!(target: &format!("scraper:{}", self.name), "An error occurred on '{}' scraper 'on_event' callback: {:#?}", self.id, err);
                self.log_action("events-error.log", &format!("{:#?} -- {:?}", err, event));
            }
        }

        return Ok(());
    }

    fn on_status(&self, event: &ScraperStatusEvent) -> Result<(), anyhow::Error> {
        if let Some(callback) = self.status_callback(event.status) {
            let lua = runtime::get();
            let table = lua.to_value(event)?;

            if let Err(err) = callback.call::<()>(table) {
                log::error!(target: &format!("scraper:{}", self.name), "An error occurred on '{}' scraper '{:?}' status callback: {:#?}", self.id, event.status, err);
            }
        }

        return Ok(());
    }

    fn scraper_js(&self) -> &str {
        return &self.scraper_js;
    }
}
