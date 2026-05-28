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
use std::sync::Arc;
use std::sync::RwLock;
use std::sync::atomic::AtomicU64;
use std::sync::atomic::Ordering;

use mlua::LuaSerdeExt as _;

use crate::events;
use crate::plugins::get_plugin;
use crate::plugins::instance::env::shared_modules;
use crate::plugins::instance::env::unichat_api::lua_scraper::LuaUniChatScraper;
use crate::plugins::instance::env::utils::table_deep_readonly;
use crate::plugins::runtime;
use crate::scraper;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;
use crate::UNICHAT_VERSION;
use crate::utils::render_emitter;
use crate::utils::safe_guard_path;
use crate::utils::userstore;

mod lua_scraper;

/* ================================================================================================================== */

pub struct UniChatAPI {
    plugin_name: String,
    event_listeners: Arc<RwLock<Vec<(u64, mlua::Function)>>>,
    next_listener_id: Arc<AtomicU64>
}

impl UniChatAPI {
    pub fn new(plugin_name: &str) -> Self {
        let name = plugin_name.to_string();
        let listeners: Arc<RwLock<Vec<(u64, mlua::Function)>>> = Arc::new(RwLock::new(Vec::new()));
        let next_id = Arc::new(AtomicU64::new(0));

        let logger_name = plugin_name.to_string();
        let listeners_clone = listeners.clone();
        tauri::async_runtime::spawn(async move {
            let mut rx = events::subscribe().unwrap();

            loop {
                let received = rx.recv().await;

                match received {
                    Ok(event) => {
                        let callbacks: Vec<mlua::Function>;
                        if let Ok(listeners) = listeners_clone.read() {
                            callbacks = listeners.clone().iter().map(|(_id, function)| function.clone()).collect();
                        } else {
                            callbacks = Vec::new();
                        }

                        let lua = runtime::get().unwrap();
                        let table = lua.to_value(&event).unwrap();

                        for callback in callbacks.iter() {
                            if let Err(err) = callback.call::<()>(table.clone()) {
                                log::error!(target: &format!("plugin:{}", logger_name), "An error occurred on UniChatAPI event listener callback: {}", err);
                            }
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                        log::warn!(target: &format!("plugin:{}", logger_name), "EventEmitter lagged, skipped {} events", skipped);
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                        log::warn!(target: &format!("plugin:{}", logger_name), "EventEmitter channel closed, exiting event loop");
                        break; // Exit the loop if the channel is closed
                    }
                }
            }
        });

        return Self {
            plugin_name: name,
            event_listeners: listeners,
            next_listener_id: next_id
        };
    }
}

impl mlua::UserData for UniChatAPI {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get_version", |_lua, _this, ()| {
            return Ok(UNICHAT_VERSION.to_string());
        });

        methods.add_method("register_scraper", |_lua, this, (id, name, scraper_js_path, on_event, opts): (String, String, String, mlua::Function, mlua::Table)| {
            let plugin = get_plugin(&this.plugin_name).map_err(mlua::Error::external)?;

            let scraper_js_path = safe_guard_path(&plugin.get_data_path(), &scraper_js_path).map_err(mlua::Error::external)?;
            let scraper_js_content = fs::read_to_string(scraper_js_path).map_err(mlua::Error::external)?;
            let scraper = LuaUniChatScraper::new(id, name, scraper_js_content, on_event, opts).map_err(mlua::Error::external)?;

            let scraper: Arc<dyn UniChatScraper + Send + Sync> = Arc::new(scraper);
            let scraper_id = scraper.id().to_string();
            scraper::register_scraper(scraper).map_err(mlua::Error::external)?;
            plugin.add_message(format!("Registered scraper '{}'.", scraper_id));

            return Ok(());
        });

        methods.add_method("fetch_shared_emotes", |_lua, _this, (platform, channel_id): (String, String)| {
            shared_emotes::fetch_shared_emotes(&platform, &channel_id).map_err(mlua::Error::external)?;
            return Ok(());
        });

        methods.add_method("get_shared_emotes", |lua, _this, ()| {
            let emotes_table = lua.create_table()?;
            if let Ok(custom_emotes) = shared_emotes::EMOTES_HASHSET.read() {
                for (code, emote) in custom_emotes.iter() {
                    let emote_table = lua.create_table()?;
                    emote_table.set("id", emote.id.clone())?;
                    emote_table.set("code", emote.code.clone())?;
                    emote_table.set("url", emote.url.clone())?;

                    let table_name = lua.create_string("UniChatEmote")?;
                    let locked_emote = table_deep_readonly(lua, &mlua::Value::String(table_name), emote_table)?;
                    emotes_table.set(code.clone(), locked_emote)?;
                }
            }

            return Ok(emotes_table);
        });

        methods.add_method("expose_module", |_lua, this, (module_name, module_table): (String, mlua::Value)| {
            let plugin = get_plugin(&this.plugin_name).map_err(mlua::Error::external)?;
            let plugin_name = this.plugin_name.clone();
            let key = format!("{}:{}", plugin_name, module_name);

            if let Err(err) = shared_modules::add(key, module_table) {
                log::error!(target: &format!("plugin:{}", plugin_name), "Failed to expose shared module '{}' for plugin '{}': {}", module_name, plugin_name, err);
                let msg = format!("Failed to expose shared module '{}': {}", module_name, err);
                plugin.add_message(msg.clone());
                return Err(mlua::Error::external(msg));
            }

            plugin.add_message(format!("Exposed shared module '{}'.", module_name));

            return Ok(());
        });

        methods.add_method("add_event_listener", |_lua, this, callback: mlua::Function| {
            let plugin = get_plugin(&this.plugin_name).map_err(mlua::Error::external)?;

            let id = this.next_listener_id.fetch_add(1, Ordering::SeqCst);
            let mut listeners = this.event_listeners.write().map_err(|_| mlua::Error::external("event_listeners lock poisoned"))?;
            listeners.push((id, callback));

            plugin.add_message(format!("Added event listener '{:?}'.", id));

            return Ok(id);
        });

        methods.add_method("remove_event_listener", |_lua, this, listener_id: u64| {
            let plugin = get_plugin(&this.plugin_name).map_err(mlua::Error::external)?;

            let mut listeners = this.event_listeners.write().map_err(|_| mlua::Error::external("event_listeners lock poisoned"))?;
            listeners.retain(|(id, _)| *id != listener_id);

            plugin.add_message(format!("Removed event listener '{:?}'.", listener_id));

            return Ok(());
        });

        methods.add_method("get_userstore_item", |lua, this, key: String| {
            let key = format!("{}:{}", this.plugin_name, key);
            let item: Option<String> = userstore::get_item(&key).map_err(mlua::Error::external)?;
            if let Some(item) = item {
                let lua_string = lua.create_string(item)?;
                return Ok(mlua::Value::String(lua_string));
            }

            return Ok(mlua::Value::Nil);
        });

        methods.add_method("set_userstore_item", |_lua, this, (key, value): (String, mlua::Value)| {
            let str_value: Option<String>;
            if let mlua::Value::String(lua_string) = value {
                str_value = Some(lua_string.to_string_lossy());
            } else if let mlua::Value::Nil = value {
                str_value = None;
            } else {
                return Err(mlua::Error::external("Value must be a string or nil"));
            }

            let key = format!("{}:{}", this.plugin_name, key);
            userstore::set_item(&key, &str_value).map_err(mlua::Error::external)?;
            return Ok(());
        });

        methods.add_method("notify", |_lua, this, message: String| {
            render_emitter::emit_notification(&this.plugin_name, &message).map_err(mlua::Error::external)?;
            return Ok(());
        });
    }
}
