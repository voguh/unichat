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
use crate::plugins::utils::table_deep_readonly;

pub struct LuaUniChatEvent {
    pub inner: UniChatEvent
}

impl mlua::UserData for LuaUniChatEvent {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(mlua::MetaMethod::ToString, |_lua, this, ()| {
            let str = serde_json::to_string(&this.inner).map_err(mlua::Error::external)?;
            return Ok(str);
        });
    }
}

impl mlua::FromLua for LuaUniChatEvent {
    fn from_lua(value: mlua::Value, lua: &mlua::Lua) -> mlua::Result<Self> {
        if let mlua::Value::UserData(userdata) = value {
            let borrow = userdata.borrow::<LuaUniChatEvent>()?;
            return Ok(LuaUniChatEvent { inner: borrow.inner.clone() });
        } else {
            let json: serde_json::Value = lua.from_value(value)?;
            let event: UniChatEvent = serde_json::from_value(json).map_err(mlua::Error::external)?;

            return Ok(LuaUniChatEvent { inner: event });
        }
    }
}

pub struct LuaUniChatEventFactory;

impl mlua::UserData for LuaUniChatEventFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Clear", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Clear(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("RemoveMessage", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::RemoveMessage(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("RemoveAuthor", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::RemoveAuthor(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Message", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Message(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Donate", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Donate(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Sponsor", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Sponsor(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("SponsorGift", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::SponsorGift(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Raid", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Raid(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Redemption", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Redemption(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });

        methods.add_method("Custom", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Custom(payload);
            return lua.create_userdata(LuaUniChatEvent { inner: event });
        });
    }
}

/* ============================================================================================== */

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

/* ============================================================================================== */

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

/* ============================================================================================== */

pub struct LuaUniChatPlatformFactory;

impl mlua::UserData for LuaUniChatPlatformFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Twitch", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatPlatform::Twitch).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("YouTube", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatPlatform::YouTube).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Other", |_lua, _this, str: String| {
            let lv = serde_plain::to_string(&UniChatPlatform::Other(str)).map_err(mlua::Error::external)?;
            return Ok(lv);
        });
    }
}

/* ============================================================================================== */

pub struct LuaUniChatAuthorTypeFactory;

impl mlua::UserData for LuaUniChatAuthorTypeFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Viewer", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Viewer).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Sponsor", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Sponsor).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Vip", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Vip).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Moderator", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Moderator).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Broadcaster", |_lua, _this, ()| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Broadcaster).map_err(mlua::Error::external)?;
            return Ok(lv);
        });

        methods.add_method("Other", |_lua, _this, str: String| {
            let lv = serde_plain::to_string(&UniChatAuthorType::Other(str)).map_err(mlua::Error::external)?;
            return Ok(lv);
        });
    }
}
