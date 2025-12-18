/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use mlua::LuaSerdeExt as _;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;

pub struct LuaUniChatEvent {
    pub inner: UniChatEvent
}

impl mlua::UserData for LuaUniChatEvent {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(mlua::MetaMethod::ToString, |_lua, this, ()| {
            let str = serde_json::to_string(&this.inner).map_err(|e| mlua::Error::external(e))?;
            return Ok(str);
        });
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

pub struct LuaUniChatPlatform {
    inner: UniChatPlatform
}

impl mlua::UserData for LuaUniChatPlatform {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(mlua::MetaMethod::ToString, |_lua, this, ()| {
            let str = serde_plain::to_string(&this.inner).map_err(|e| mlua::Error::external(e))?;
            return Ok(str);
        });
    }
}

pub struct LuaUniChatPlatformFactory;

impl mlua::UserData for LuaUniChatPlatformFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("YouTube", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatPlatform {  inner: UniChatPlatform::YouTube });
        });

        methods.add_method("Twitch", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatPlatform {  inner: UniChatPlatform::Twitch });
        });

        methods.add_method("Other", |lua, _this, str: String| {
            return lua.create_userdata(LuaUniChatPlatform {  inner: UniChatPlatform::Other(str) });
        });
    }
}

/* ============================================================================================== */

pub struct LuaUniChatAuthorType {
    inner: UniChatAuthorType
}

impl mlua::UserData for LuaUniChatAuthorType {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_meta_method(mlua::MetaMethod::ToString, |_lua, this, ()| {
            let str = serde_plain::to_string(&this.inner).map_err(|e| mlua::Error::external(e))?;
            return Ok(str);
        });
    }
}

pub struct LuaUniChatAuthorTypeFactory;

impl mlua::UserData for LuaUniChatAuthorTypeFactory {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Viewer", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Viewer });
        });

        methods.add_method("Sponsor", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Sponsor });
        });

        methods.add_method("Vip", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Vip });
        });

        methods.add_method("Moderator", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Moderator });
        });

        methods.add_method("Broadcaster", |lua, _this, ()| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Broadcaster });
        });

        methods.add_method("Other", |lua, _this, str: String| {
            return lua.create_userdata(LuaUniChatAuthorType {  inner: UniChatAuthorType::Other(str) });
        });
    }
}
