/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::LazyLock;
use std::sync::Mutex;
use std::sync::MutexGuard;

use anyhow::Error;
use anyhow::anyhow;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatRedemptionEventPayload;
use crate::utils::irc::IRCCommand;
use crate::utils::irc::IRCMessage;

mod privmsg;
mod raw_clearchat;
mod raw_clearmsg;
mod raw_usernotice;
pub mod structs;
mod ws_reward_redemption;

/* ========================================================================== */

#[derive(Default)]
struct PendingRedemptions {
    redemptions: HashMap<(String, String), UniChatRedemptionEventPayload>,
    messages: HashMap<(String, String), UniChatMessageEventPayload>
}

static PENDING: LazyLock<Mutex<PendingRedemptions>> = LazyLock::new(Default::default);
fn lock_pending() -> MutexGuard<'static, PendingRedemptions> {
    return PENDING.lock().expect("TwitchMapper::PENDING lock poisoned");
}

/* ========================================================================== */

fn merge_redemption_events(
    redemption_event: UniChatRedemptionEventPayload,
    message_event: UniChatMessageEventPayload
) -> UniChatRedemptionEventPayload {
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
        author_type: message_event.author_type,

        reward_id: redemption_event.reward_id,
        reward_title: redemption_event.reward_title,
        reward_description: redemption_event.reward_description,
        reward_cost: redemption_event.reward_cost,
        reward_icon_url: redemption_event.reward_icon_url,

        message_id: redemption_event.message_id,
        message_text: Some(message_event.message_text),
        emotes: message_event.emotes,

        timestamp: redemption_event.timestamp
    };
}

pub fn handle_redemption_event(
    redemption_event: UniChatRedemptionEventPayload
) -> Option<UniChatRedemptionEventPayload> {
    let key = (redemption_event.reward_id.clone(), redemption_event.author_id.clone());
    let mut pending = lock_pending();
    if let Some(message_event) = pending.messages.remove(&key) {
        return Some(merge_redemption_events(redemption_event, message_event));
    }

    pending.redemptions.insert(key, redemption_event);

    return None;
}

pub fn handle_redemption_message_event(
    reward_id: &str,
    message_event: UniChatMessageEventPayload
) -> Option<UniChatRedemptionEventPayload> {
    let key = (reward_id.to_string(), message_event.author_id.clone());
    let mut pending = lock_pending();
    if let Some(redemption_event) = pending.redemptions.remove(&key) {
        return Some(merge_redemption_events(redemption_event, message_event));
    }

    pending.messages.insert(key, message_event);

    return None;
}

/* ========================================================================== */

pub fn get_tag(tags: &HashMap<String, Option<String>>, key: &str) -> Option<String> {
    return tags.get(key).cloned().flatten();
}

pub fn require_tag(tags: &HashMap<String, Option<String>>, key: &str) -> Result<String, Error> {
    return get_tag(tags, key).ok_or(anyhow!("Missing '{}' tag", key));
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
