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

use crate::events::FLAG_TWITCH_STREAK_DAYS;
use crate::events::UniChatEvent;
use crate::events::UniChatMessageEventPayload;
use crate::events::UniChatPlatform;
use crate::twitch::mapper::get_tag;
use crate::twitch::mapper::require_tag;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;
use crate::utils::get_current_timestamp;

/* ========================================================================== */

pub fn parse(
    channel: String,
    text: Option<&str>,
    tags: &HashMap<String, Option<String>>
) -> Result<Option<UniChatEvent>, Error> {
    let text = text.unwrap_or_default();

    let room_id = require_tag(tags, "room-id")?;
    let mut flags = inject_raw_tags(tags);
    let author_id = require_tag(tags, "user-id")?;
    let login = require_tag(tags, "login")?;
    let author_username = Some(login);
    let author_name = require_tag(tags, "display-name")?;
    let author_color = parse_author_color(get_tag(tags, "color"), &author_username)?;
    let author_badges = parse_author_badges(get_tag(tags, "badges"));
    let author_type = parse_author_type(tags);
    let message_id = require_tag(tags, "id")?;
    let message = parse_message_string(text);
    let emotes = parse_message_emotes(get_tag(tags, "emotes"), text)?;
    let timestamp_usec = get_current_timestamp();

    let streak_days = require_tag(tags, "msg-param-value")?;
    flags.insert(String::from(FLAG_TWITCH_STREAK_DAYS), Some(streak_days));

    let event = UniChatEvent::Message(UniChatMessageEventPayload {
        channel_id: room_id,
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: flags,

        author_id: author_id,
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_profile_picture_url: None,
        author_badges: author_badges,
        author_type: author_type,

        message_id: message_id,
        message_text: message,
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
