/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::plugins::instance::env::utils::from_lua_value;
use crate::plugins::instance::env::utils::table_deep_readonly;

/* ========================================================================== */

fn create_readonly_event(lua: &mlua::Lua, event: &UniChatEvent) -> Result<mlua::Table, mlua::Error> {
    let value = lua.to_value(event)?;
    let table: mlua::Table = lua.unpack(value).map_err(|_| mlua::Error::runtime("UniChatEvent must serialize to a table"))?;

    let table_name = lua.create_string("UniChatEvent")?;
    return table_deep_readonly(lua, &mlua::Value::String(table_name), table);
}

pub struct LuaUniChatEventFactory;

impl mlua::UserData for LuaUniChatEventFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Clear", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Clear(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("RemoveMessage", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::RemoveMessage(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("RemoveAuthor", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::RemoveAuthor(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Message", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Message(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Donate", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Donate(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Sponsor", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Sponsor(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("SponsorGift", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::SponsorGift(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Raid", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Raid(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Redemption", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Redemption(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Cheer", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Cheer(payload);
            return create_readonly_event(lua, &event);
        });

        methods.add_method("Custom", |lua, _this, data: mlua::Value| {
            let payload = from_lua_value(lua, data)?;
            let event = UniChatEvent::Custom(payload);
            return create_readonly_event(lua, &event);
        });
    }
}

/* ========================================================================== */

pub struct LuaUniChatEmoteFactory;

impl mlua::UserData for LuaUniChatEmoteFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("new", |lua, _this, (id, code, url): (String, String, String)| {
            let table = lua.create_table()?;
            table.set("id", id)?;
            table.set("code", code)?;
            table.set("url", url)?;

            let table_name = lua.create_string("UniChatEmote")?;
            let locked_table = table_deep_readonly(lua, &mlua::Value::String(table_name), table)?;

            return Ok(locked_table);
        });
    }
}

/* ========================================================================== */

pub struct LuaUniChatBadgeFactory;

impl mlua::UserData for LuaUniChatBadgeFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("new", |lua, _this, (code, url): (String, String)| {
            let table = lua.create_table()?;
            table.set("code", code)?;
            table.set("url", url)?;

            let table_name = lua.create_string("UniChatBadge")?;
            let locked_table = table_deep_readonly(lua, &mlua::Value::String(table_name), table)?;

            return Ok(locked_table);
        });
    }
}

/* ========================================================================== */

pub struct LuaUniChatPlatformFactory;

impl mlua::UserData for LuaUniChatPlatformFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Twitch", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatPlatform::Twitch).expect("Failed to serialize UniChatPlatform");
            return Ok(lv);
        });

        methods.add_method("YouTube", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatPlatform::YouTube).expect("Failed to serialize UniChatPlatform");
            return Ok(lv);
        });

        methods.add_method("Other", |_lua, _this, str: String| {
            let str = str.trim();
            if str.is_empty() {
                return Err(mlua::Error::external("String cannot be empty"));
            }

            let obj: UniChatPlatform = serde_plain::from_str(&str).map_err(mlua::Error::external)?;
            let lv = serde_plain::to_string(&obj).expect("Failed to serialize UniChatPlatform");
            return Ok(lv);
        });
    }
}

/* ========================================================================== */

pub struct LuaUniChatAuthorTypeFactory;

impl mlua::UserData for LuaUniChatAuthorTypeFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Viewer", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Viewer).expect("Failed to serialize UniChatAuthorType");
            return Ok(lv);
        });

        methods.add_method("Sponsor", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Sponsor).expect("Failed to serialize UniChatAuthorType");
            return Ok(lv);
        });

        methods.add_method("Moderator", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Moderator).expect("Failed to serialize UniChatAuthorType");
            return Ok(lv);
        });

        methods.add_method("Broadcaster", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Broadcaster).expect("Failed to serialize UniChatAuthorType");
            return Ok(lv);
        });

        methods.add_method("Other", |_lua, _this, str: String| {
            let str = str.trim();
            if str.is_empty() {
                return Err(mlua::Error::external("String cannot be empty"));
            }

            let obj: UniChatAuthorType = serde_plain::from_str(&str).map_err(mlua::Error::external)?;
            let lv = serde_plain::to_string(&obj).expect("Failed to serialize UniChatAuthorType");
            return Ok(lv);
        });
    }
}
