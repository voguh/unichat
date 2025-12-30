/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use crate::error::Error;
use crate::events::unichat::UniChatDonateEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::irc::IRCMessage;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;
use crate::utils::get_current_timestamp;

pub fn parse(channel: String, text: String, message: &IRCMessage, tags: HashMap<String, Option<String>>) -> Result<Option<UniChatEvent>, Error> {
    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or("Missing room-id tag")?;
    let author_id = tags.get("user-id").and_then(|v| v.as_ref()).ok_or("Missing user-id tag")?;
    let author_username = parse_author_username(&message.prefix)?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let bits = tags.get("bits").and_then(|v| v.as_ref()).ok_or("Missing bits tag")?;
    let bits_value: f32 = bits.parse()?;
    let message_id = tags.get("id").and_then(|v| v.as_ref()).ok_or("Missing id tag")?;
    let message = parse_message_string(&text)?;
    let emotes = parse_message_emotes(tags.get("emotes"), &text)?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::Donate(UniChatDonateEventPayload {
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

        value: bits_value,
        currency: String::from("Bits"),

        message_id: message_id.to_owned(),
        message_text: Some(message),
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
