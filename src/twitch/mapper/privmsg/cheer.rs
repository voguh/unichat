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

use anyhow::Error;

use crate::events::unichat::UniChatCheerEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::twitch::mapper::require_tag;
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

/* ========================================================================== */

pub fn parse(
    channel: String,
    text: String,
    message: &IRCMessage,
    tags: HashMap<String, Option<String>>
) -> Result<Option<UniChatEvent>, Error> {
    let room_id = require_tag(&tags, "room-id")?;
    let author_id = require_tag(&tags, "user-id")?;
    let author_username = parse_author_username(&message.prefix);
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"));
    let author_type = parse_author_type(&tags);
    let bits = require_tag(&tags, "bits")?;
    let bits_value: u32 = bits.parse()?;
    let message_id = require_tag(&tags, "id")?;
    let message = parse_message_string(&text);
    let emotes = parse_message_emotes(tags.get("emotes"), &text)?;
    let timestamp_usec = get_current_timestamp();

    let event = UniChatEvent::Cheer(UniChatCheerEventPayload {
        channel_id: room_id,
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: inject_raw_tags(&tags),

        author_id: author_id,
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_profile_picture_url: None,
        author_badges: author_badges,
        author_type: author_type,

        value: Some(bits_value),
        currency: Some(String::from("Bits")),

        cheer_id: None,
        cheer_title: None,
        cheer_description: None,
        cheer_icon_url: None,

        message_id: message_id,
        message_text: Some(message),
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
