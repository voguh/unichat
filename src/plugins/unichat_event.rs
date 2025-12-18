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

pub struct LuaUniChatEvent;

impl mlua::UserData for LuaUniChatEvent {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Clear", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Clear(payload);
            let lv = lua.to_value(&event)?;
            return Ok(lv);
        });

        methods.add_method("RemoveMessage", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::RemoveMessage(payload);
            return lua.to_value(&event);
        });

        methods.add_method("RemoveAuthor", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::RemoveAuthor(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Message", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Message(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Donate", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Donate(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Sponsor", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Sponsor(payload);
            return lua.to_value(&event);
        });

        methods.add_method("SponsorGift", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::SponsorGift(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Raid", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Raid(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Redemption", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Redemption(payload);
            return lua.to_value(&event);
        });

        methods.add_method("Custom", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let event = UniChatEvent::Custom(payload);
            return lua.to_value(&event);
        });
    }
}

/* ============================================================================================== */

pub struct LuaUniChatPlatform;

impl mlua::UserData for LuaUniChatPlatform {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("YouTube", |lua, _this, ()| {
            let platform = UniChatPlatform::YouTube;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Twitch", |lua, _this, ()| {
            let platform = UniChatPlatform::Twitch;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Other", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let platform = UniChatPlatform::Other(payload);
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });
    }
}

/* ============================================================================================== */

pub struct LuaUniChatAuthorType;

impl mlua::UserData for LuaUniChatAuthorType {
    fn add_methods<M: mlua::UserDataMethods<Self>>(methods: &mut M) {
        methods.add_method("Viewer", |lua, _this, ()| {
            let platform = UniChatAuthorType::Viewer;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Sponsor", |lua, _this, ()| {
            let platform = UniChatAuthorType::Sponsor;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Vip", |lua, _this, ()| {
            let platform = UniChatAuthorType::Vip;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Moderator", |lua, _this, ()| {
            let platform = UniChatAuthorType::Moderator;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Broadcaster", |lua, _this, ()| {
            let platform = UniChatAuthorType::Broadcaster;
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });

        methods.add_method("Other", |lua, _this, data: mlua::Value| {
            let payload = lua.from_value(data)?;
            let platform = UniChatAuthorType::Other(payload);
            let lv = lua.to_value(&platform)?;
            return Ok(lv);
        });
    }
}
