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

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::twitch::mapper::handle_redemption_message_event;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;
use crate::utils::get_current_timestamp;
use crate::utils::irc::IRCMessage;

pub fn parse(channel: String, text: String, message: &IRCMessage, tags: HashMap<String, Option<String>>) -> Result<Option<UniChatEvent>, Error> {
    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing room-id tag"))?;
    let author_id = tags.get("user-id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing user-id tag"))?;
    let author_username = parse_author_username(&message.prefix)?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let message_id = tags.get("id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing id tag"))?;
    let message = parse_message_string(&text)?;
    let emotes = parse_message_emotes(tags.get("emotes"), &text)?;
    let timestamp_usec = get_current_timestamp()?;

    let event_payload = UniChatMessageEventPayload {
        channel_id: room_id.to_owned(),
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: inject_raw_tags(&tags),

        author_id: author_id.to_owned(),
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_profile_picture_url: None,
        author_badges: author_badges,
        author_type: author_type,

        message_id: message_id.to_owned(),
        message_text: message,
        emotes: emotes,

        timestamp: timestamp_usec
    };

    if let Some(reward_id) = tags.get("custom-reward-id").and_then(|v| v.as_ref()) {
        if let Some(redemption_payload) = handle_redemption_message_event(&reward_id, event_payload) {
            let event = UniChatEvent::Redemption(redemption_payload);

            return Ok(Some(event));
        }
    } else {
        let event = UniChatEvent::Message(event_payload);

        return Ok(Some(event));
    }

    return Ok(None);
}
