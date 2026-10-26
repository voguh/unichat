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

use crate::events::UniChatEvent;
use crate::events::UniChatPlatform;
use crate::events::UniChatSponsorGiftEventPayload;
use crate::twitch::mapper::require_tag;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username_str;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::utils::get_current_timestamp;

/* ========================================================================== */

pub fn parse(channel: String, tags: &HashMap<String, Option<String>>) -> Result<Option<UniChatEvent>, Error> {
    let room_id = require_tag(tags, "room-id")?;
    let author_id = require_tag(tags, "user-id")?;
    let author_username = parse_author_username_str(tags.get("login"))?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"));
    let author_type = parse_author_type(tags);
    let message_id = require_tag(tags, "id")?;
    let tier = require_tag(tags, "msg-param-sub-plan")?;
    let timestamp_usec = get_current_timestamp();

    let event = UniChatEvent::SponsorGift(UniChatSponsorGiftEventPayload {
        channel_id: room_id,
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: inject_raw_tags(tags),

        author_id: author_id,
        author_username: author_username,
        author_display_name: author_name,
        author_display_color: author_color,
        author_profile_picture_url: None,
        author_badges: author_badges,
        author_type: author_type,

        message_id: message_id,
        tier: Some(tier),
        count: 1,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
