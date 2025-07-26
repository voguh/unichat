/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use irc::client::prelude::*;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_MESSAGE_TYPE;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;

pub fn parse(channel: String, text: String, message: &Message, tags: HashMap<String, String>) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let room_id = tags.get("room-id").ok_or("Missing room-id tag")?;
    let author_id = tags.get("user-id").ok_or("Missing user-id tag")?;
    let author_username = parse_author_username(&message.prefix)?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let message_id = tags.get("id").ok_or("Missing id tag")?;
    let message = parse_message_string(&text)?;
    let emotes = parse_message_emotes(tags.get("emotes"), &text)?;
    let timestamp_usec = tags.get("tmi-sent-ts").ok_or("Missing or invalid tmi-sent-ts tag")?;
    let timestamp_usec: i64 = timestamp_usec.parse()?;

    let event = UniChatEvent::Message {
        event_type: String::from(UNICHAT_EVENT_MESSAGE_TYPE),
        data: UniChatMessageEventPayload {
            channel_id: room_id.to_owned(),
            channel_name: Some(channel),
            platform: UniChatPlatform::Twitch,

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
        }
    };

    return Ok(Some(event));
}
