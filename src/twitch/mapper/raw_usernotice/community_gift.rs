/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorGiftEventPayload;
use crate::events::unichat::UNICHAT_EVENT_SPONSOR_GIFT_TYPE;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username_str;
use crate::twitch::mapper::structs::inject_raw_tags;

pub fn parse(channel: String, tags: &HashMap<String, String>) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let room_id = tags.get("room-id").ok_or("Missing room-id tag")?;
    let author_id = tags.get("user-id").ok_or("Missing user-id tag")?;
    let author_username = parse_author_username_str(tags.get("login"))?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let message_id = tags.get("id").ok_or("Missing id tag")?;
    let tier = tags.get("msg-param-sub-plan").ok_or("Missing msg-param-sub-plan tag")?;
    let count_str = tags.get("msg-param-mass-gift-count").ok_or("Missing msg-param-mass-gift-count tag")?;
    let count: u16 = count_str.parse()?;
    let timestamp_usec = tags.get("tmi-sent-ts").ok_or("Missing or invalid tmi-sent-ts tag")?;
    let timestamp_usec: i64 = timestamp_usec.parse()?;

    let event = UniChatEvent::SponsorGift {
        event_type: String::from(UNICHAT_EVENT_SPONSOR_GIFT_TYPE),
        data: UniChatSponsorGiftEventPayload {
            channel_id: room_id.to_owned(),
            channel_name: Some(channel),

            platform: UniChatPlatform::Twitch,
            flags: inject_raw_tags(&tags),

            author_id: author_id.to_owned(),
            author_username: author_username,
            author_display_name: author_name,
            author_display_color: author_color,
            author_profile_picture_url:None,
            author_badges: author_badges,
            author_type: author_type,

            message_id: message_id.to_owned(),
            tier: Some(tier.to_owned()),
            count: count,

            timestamp: timestamp_usec
        }
    };

    return Ok(Some(event));
}
