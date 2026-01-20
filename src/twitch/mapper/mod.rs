/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::LazyLock;
use std::sync::Mutex;

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatRedemptionEventPayload;
use crate::utils::irc::IRCCommand;
use crate::utils::irc::IRCMessage;

mod privmsg;
mod raw_clearchat;
mod raw_clearmsg;
mod raw_usernotice;
mod ws_reward_redemption;
pub mod structs;

/* ========================================================================== */

static REDEMPTION_EVENT_CACHE: LazyLock<Mutex<HashMap<String, HashMap<String, UniChatRedemptionEventPayload>>>> = LazyLock::new(|| Mutex::new(HashMap::new()));
static REDEMPTION_MESSAGE_EVENT_CACHE: LazyLock<Mutex<HashMap<String, HashMap<String, UniChatMessageEventPayload>>>> = LazyLock::new(|| Mutex::new(HashMap::new()));

fn merge_redemption_events(redemption_event: UniChatRedemptionEventPayload, message_event: UniChatMessageEventPayload) -> UniChatRedemptionEventPayload {
    return UniChatRedemptionEventPayload {
        channel_id: message_event.channel_id,
        channel_name: message_event.channel_name,

        platform: message_event.platform,
        flags: message_event.flags,

        author_id: message_event.author_id,
        author_username: message_event.author_username,
        author_display_name: message_event.author_display_name,
        author_display_color: message_event.author_display_color,
        author_profile_picture_url: message_event.author_profile_picture_url,
        author_badges: message_event.author_badges,
        author_type: Some(message_event.author_type),

        reward_id: redemption_event.reward_id,
        reward_title: redemption_event.reward_title,
        reward_description: redemption_event.reward_description,
        reward_cost: redemption_event.reward_cost,
        reward_icon_url: redemption_event.reward_icon_url,

        message_id: redemption_event.message_id,
        message_text: Some(message_event.message_text),
        emotes: message_event.emotes,

        timestamp: redemption_event.timestamp,
    };
}

pub fn handle_redemption_event(redemption_event: UniChatRedemptionEventPayload) -> Option<UniChatRedemptionEventPayload> {
    if let Ok(mut message_event_cache) = REDEMPTION_MESSAGE_EVENT_CACHE.lock() {
        if let Some(reward_message_events) = message_event_cache.get_mut(&redemption_event.reward_id) {
            if let Some(message_event) = reward_message_events.remove(&redemption_event.author_id) {
                return Some(merge_redemption_events(redemption_event, message_event))
            }
        } else {
            if let Ok(mut redemption_event_cache) = REDEMPTION_EVENT_CACHE.lock() {
                let reward_redemption_events = redemption_event_cache.entry(redemption_event.reward_id.clone()).or_insert_with(HashMap::new);
                reward_redemption_events.insert(redemption_event.author_id.clone(), redemption_event);
            }
        }
    }

    return None;
}

pub fn handle_redemption_message_event(reward_id: &str, message_event: UniChatMessageEventPayload) -> Option<UniChatRedemptionEventPayload> {
    if let Ok(mut redemption_event_cache) = REDEMPTION_EVENT_CACHE.lock() {
        if let Some(redemption_event) = redemption_event_cache.get_mut(reward_id) {
            if let Some(redemption_event) = redemption_event.remove(&message_event.author_id) {
                return Some(merge_redemption_events(redemption_event, message_event))
            }
        } else {
            if let Ok(mut message_event_cache) = REDEMPTION_MESSAGE_EVENT_CACHE.lock() {
                let reward_message_events = message_event_cache.entry(reward_id.to_string()).or_insert_with(HashMap::new);
                reward_message_events.insert(message_event.author_id.clone(), message_event);
            }
        }
    }

    return None;
}

/* ========================================================================== */

fn parse_channel_name(channel: &String) -> String {
    return channel.replace("#", "");
}

pub fn parse_irc(message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    if let IRCCommand::PRIVMSG(channel, text) = &message.command {
        let channel_name = parse_channel_name(channel);
        return privmsg::parse(channel_name, text.to_owned(), message);
    } else if let IRCCommand::Raw(cmd, payload) = &message.command {
        let channel = payload.get(0).ok_or(anyhow!("Missing channel name"))?;
        let channel_name = parse_channel_name(channel);

        if cmd == "CLEARCHAT" {
            return raw_clearchat::parse(channel_name, message);
        } else if cmd == "CLEARMSG" {
            return raw_clearmsg::parse(channel_name, message);
        } else if cmd == "USERNOTICE" {
            return raw_usernotice::parse(channel_name, message);
        }
    }

    return Ok(None);
}

pub fn parse_ws(message: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    if let Some(reward_redemption) = message.get("rewardRedemption") {
        return ws_reward_redemption::parse(reward_redemption.clone());
    }

    return Ok(None);
}
