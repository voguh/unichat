/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::Error;
use mlua::FromLua;
use mlua::Function;
use mlua::LuaSerdeExt;
use mlua::Table;
use mlua::Value;
use serde::Deserialize;

use crate::events;
use crate::events::UniChatEvent;
use crate::events::UniChatPlatform;
use crate::plugins::instance::env::utils::from_lua_value;
use crate::plugins::runtime;
use crate::scraper;
use crate::scraper::ScraperLogKind;
use crate::scraper::ScraperStatus;
use crate::scraper::ScraperStatusEvent;
use crate::scraper::UniChatScraper;

/* ========================================================================== */

fn get_property<R: FromLua>(table: &Table, key: &str) -> Option<R> {
    return table.get(key).ok();
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
    on_ready: Option<Function>,
    on_error: Option<Function>,
    on_fatal: Option<Function>
}

impl LuaUniChatScraper {
    pub fn new(id: String, name: String, scraper_js: String, on_event: Function, opts: Table) -> Result<Self, Error> {
        let default_text = format!("Enter {} chat url...", name);
        let editing_tooltip_message = get_property(&opts, "editing_tooltip_message").unwrap_or(default_text.clone());
        let editing_tooltip_urls = get_property(&opts, "editing_tooltip_urls").unwrap_or_default();
        let placeholder_text = get_property(&opts, "placeholder_text").unwrap_or(default_text);
        let badges = get_property(&opts, "badges").unwrap_or_default();
        let icon = get_property(&opts, "icon").unwrap_or_else(|| String::from("fas fa-video"));
        let validate_url = opts.get("validate_url")?;
        let on_ready = get_property(&opts, "on_ready");
        let on_error = get_property(&opts, "on_error");
        let on_fatal = get_property(&opts, "on_fatal");

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
            on_ready: on_ready,
            on_error: on_error,
            on_fatal: on_fatal
        });
    }

    fn status_callback(&self, status: ScraperStatus) -> Option<&Function> {
        return match status {
            ScraperStatus::Ready => self.on_ready.as_ref(),
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
        scraper::log_action(&self.id, ScraperLogKind::Raw, || event.to_string());

        let table = lua.to_value(&event)?;

        match self.on_event.call::<Option<Value>>(table) {
            Ok(Some(parsed_event)) => {
                let json: serde_json::Value = from_lua_value(lua, parsed_event)?;

                let event_type = json.get("type").and_then(|v| v.as_str()).unwrap_or_default();
                if event_type == "unichat:userstore_update" {
                    log::warn!(target: &format!("scraper:{}", self.id), "Event 'unichat:userstore_update' is not allowed");
                    return Ok(());
                }

                if event_type != "unichat:custom" {
                    let raw_platform = json.pointer("/data/platform");
                    let platform = raw_platform.and_then(|v| UniChatPlatform::deserialize(v).ok());
                    if let Some(platform) = &platform {
                        if !matches!(platform, UniChatPlatform::Other(_)) {
                            log::warn!(target: &format!("scraper:{}", self.id), "Event '{}' with reserved platform {:?} is not allowed", event_type, platform);
                            return Ok(());
                        }
                    } else {
                        log::warn!(target: &format!("scraper:{}", self.id), "Event '{}' without platform is not allowed", event_type);
                        return Ok(());
                    }
                }

                let parsed: UniChatEvent = serde_json::from_value(json)?;
                scraper::log_action(&self.id, ScraperLogKind::Parsed, || {
                    return serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
                });

                events::emit(parsed);
            }
            Ok(None) => {
                scraper::log_action(&self.id, ScraperLogKind::Unknown, || event.to_string());
            }
            Err(err) => {
                log::error!(target: &format!("scraper:{}", self.id), "An error occurred on 'on_event' callback: {:#?}", err);
                scraper::log_action(&self.id, ScraperLogKind::Error, || format!("{:#?} -- {:?}", err, event));
            }
        }

        return Ok(());
    }

    fn on_status(&self, event: &ScraperStatusEvent) -> Result<(), anyhow::Error> {
        if let Some(callback) = self.status_callback(event.status) {
            let lua = runtime::get();
            let table = lua.to_value(event)?;

            if let Err(err) = callback.call::<()>(table) {
                log::error!(target: &format!("scraper:{}", self.id), "An error occurred on '{:?}' status callback: {:#?}", event.status, err);
            }
        }

        return Ok(());
    }

    fn scraper_js(&self) -> &str {
        return &self.scraper_js;
    }
}
