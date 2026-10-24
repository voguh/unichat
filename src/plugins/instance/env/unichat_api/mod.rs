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
use std::sync::RwLockWriteGuard;
use std::sync::atomic::AtomicU64;
use std::sync::atomic::Ordering;

use mlua::Error;
use mlua::Function;
use mlua::LuaSerdeExt as _;
use mlua::Table;
use mlua::UserData;
use mlua::UserDataMethods;
use mlua::Value;

use crate::UNICHAT_VERSION;
use crate::events;
use crate::plugins::get_plugin;
use crate::plugins::instance::env::shared_modules;
use crate::plugins::instance::env::unichat_api::lua_scraper::LuaUniChatScraper;
use crate::plugins::instance::env::utils::table_deep_readonly;
use crate::plugins::runtime;
use crate::scraper;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;
use crate::utils::render_emitter;
use crate::utils::safe_guard_path;
use crate::utils::userstore;

mod lua_scraper;

/* ========================================================================== */

pub struct UniChatAPI {
    plugin_name: String,
    event_listeners: Arc<RwLock<Vec<(u64, Function)>>>,
    next_listener_id: Arc<AtomicU64>
}

impl UniChatAPI {
    pub fn new(plugin_name: &str) -> Self {
        let name = plugin_name.to_string();
        let listeners: Arc<RwLock<Vec<(u64, Function)>>> = Arc::new(RwLock::new(Vec::new()));
        let next_id = Arc::new(AtomicU64::new(0));

        let logger_name = name.to_string();
        let listeners_clone = listeners.clone();
        tauri::async_runtime::spawn(async move {
            let mut rx = events::subscribe();

            loop {
                let received = rx.recv().await;

                match received {
                    Ok(event) => {
                        let callbacks: Vec<Function>;
                        {
                            let listeners = listeners_clone.read().expect("Event listeners lock poisoned");
                            callbacks = listeners.iter().map(|(_id, function)| function.clone()).collect();
                        }

                        let lua = runtime::get();
                        let table = lua.to_value(&event).expect("Failed to convert UniChatEvent to Lua value");

                        for callback in callbacks.iter() {
                            if let Err(err) = callback.call::<()>(table.clone()) {
                                log::error!(target: &format!("plugin:{}", logger_name), "An error occurred on UniChatAPI event listener callback: {:#?}", err);
                            }
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                        log::warn!(target: &format!("plugin:{}", logger_name), "EventEmitter lagged, skipped {} events", skipped);
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                        log::warn!(target: &format!("plugin:{}", logger_name), "EventEmitter channel closed, exiting event loop");
                        break;
                    }
                }
            }
        });

        return Self { plugin_name: name, event_listeners: listeners, next_listener_id: next_id };
    }

    fn write_event_listeners(&self) -> RwLockWriteGuard<'_, Vec<(u64, Function)>> {
        return self.event_listeners.write().expect("Event listeners lock poisoned");
    }
}

impl UserData for UniChatAPI {
    fn add_methods<M: UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("get_version", |_lua, _this, ()| {
            return Ok(UNICHAT_VERSION.to_string());
        });

        methods.add_method(
            "register_scraper",
            |_lua, this, (id, name, scraper_js_path, on_event, opts): (String, String, String, Function, Table)| {
                let plugin = get_plugin(&this.plugin_name).map_err(Error::external)?;

                let js_path = safe_guard_path(&plugin.get_data_path(), &scraper_js_path).map_err(Error::external)?;
                let js_content = fs::read_to_string(js_path).map_err(Error::external)?;
                let scraper = LuaUniChatScraper::new(id, name, js_content, on_event, opts).map_err(Error::external)?;
                let scraper = Arc::new(scraper);

                let scraper_id = scraper.id().to_string();
                scraper::register_scraper(scraper).map_err(Error::external)?;
                plugin.add_message(format!("Registered scraper '{}'.", scraper_id));

                return Ok(());
            }
        );

        methods.add_method("fetch_shared_emotes", |_lua, _this, (platform, channel_id): (String, String)| {
            shared_emotes::fetch_shared_emotes(&platform, &channel_id);
            return Ok(());
        });

        methods.add_method("get_shared_emotes", |lua, _this, ()| {
            let emotes_table = lua.create_table()?;
            for (code, emote) in shared_emotes::read().iter() {
                let emote_table = lua.create_table()?;
                emote_table.set("id", emote.id.clone())?;
                emote_table.set("code", emote.code.clone())?;
                emote_table.set("url", emote.url.clone())?;

                let table_name = lua.create_string("UniChatEmote")?;
                let locked_emote = table_deep_readonly(lua, &Value::String(table_name), emote_table)?;
                emotes_table.set(code.clone(), locked_emote)?;
            }

            return Ok(emotes_table);
        });

        methods.add_method("expose_module", |_lua, this, (module_name, module_table): (String, Value)| {
            let plugin = get_plugin(&this.plugin_name).map_err(Error::external)?;
            let plugin_name = this.plugin_name.clone();
            let key = format!("{}:{}", plugin_name, module_name);

            if let Err(err) = shared_modules::add(key, module_table) {
                log::error!(target: &format!("plugin:{}", plugin_name), "Failed to expose shared module '{}' for plugin '{}': {:#?}", module_name, plugin_name, err);
                let msg = format!("Failed to expose shared module '{}': {:#?}", module_name, err);
                plugin.add_message(msg.clone());
                return Err(Error::external(msg));
            }

            plugin.add_message(format!("Exposed shared module '{}'.", module_name));

            return Ok(());
        });

        methods.add_method("add_event_listener", |_lua, this, callback: Function| {
            let plugin = get_plugin(&this.plugin_name).map_err(Error::external)?;

            let id = this.next_listener_id.fetch_add(1, Ordering::SeqCst);
            let mut listeners = this.write_event_listeners();
            listeners.push((id, callback));

            plugin.add_message(format!("Added event listener '{:?}'.", id));

            return Ok(id);
        });

        methods.add_method("remove_event_listener", |_lua, this, listener_id: u64| {
            let plugin = get_plugin(&this.plugin_name).map_err(Error::external)?;

            let mut listeners = this.write_event_listeners();
            listeners.retain(|(id, _)| *id != listener_id);

            plugin.add_message(format!("Removed event listener '{:?}'.", listener_id));

            return Ok(());
        });

        methods.add_method("get_userstore_item", |lua, this, key: String| {
            let key = format!("{}:{}", this.plugin_name, key);
            let item: Option<String> = userstore::get_item(&key).map_err(Error::external)?;
            if let Some(item) = item {
                let lua_string = lua.create_string(item)?;
                return Ok(Value::String(lua_string));
            }

            return Ok(Value::Nil);
        });

        methods.add_method("set_userstore_item", |_lua, this, (key, value): (String, Value)| {
            let str_value: Option<String>;
            if let Value::String(lua_string) = value {
                str_value = Some(lua_string.to_string_lossy());
            } else if let Value::Nil = value {
                str_value = None;
            } else {
                return Err(Error::external("Value must be a string or nil"));
            }

            let key = format!("{}:{}", this.plugin_name, key);
            userstore::set_item(&key, &str_value).map_err(Error::external)?;
            return Ok(());
        });

        methods.add_method("notify", |_lua, this, message: String| {
            render_emitter::emit_notification(&this.plugin_name, &message);
            return Ok(());
        });
    }
}
