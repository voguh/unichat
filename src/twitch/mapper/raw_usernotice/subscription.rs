/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorEventPayload;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username_str;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;
use crate::utils::get_current_timestamp;
use crate::utils::irc::IRCCommand;
use crate::utils::irc::IRCMessage;

pub fn parse(message: &IRCMessage, tags: &HashMap<String, Option<String>>) -> Result<Option<UniChatEvent>, Error> {
    let (channel, message_text) = match &message.command {
        IRCCommand::Raw(_, payload) => Ok((payload[0].clone(), payload.get(1))),
        _ => Err(anyhow!("Invalid message command type"))
    }?;

    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing room-id tag"))?;
    let author_id = tags.get("user-id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing user-id tag"))?;
    let author_username = parse_author_username_str(tags.get("login"))?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let tier = tags.get("msg-param-sub-plan").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing msg-param-sub-plan tag"))?;
    let months_str = tags.get("msg-param-cumulative-months").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing msg-param-cumulative-months tag"))?;
    let months: u16 = months_str.parse()?;
    let message_id = tags.get("id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing id tag"))?;
    let message = message_text.and_then(|text| parse_message_string(text).ok());
    let emotes = parse_message_emotes(tags.get("emotes"), &message.clone().unwrap_or_default())?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::Sponsor(UniChatSponsorEventPayload {
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

        tier: Some(tier.to_owned()),
        months: months,

        message_id: message_id.to_owned(),
        message_text: message.clone(),
        emotes: emotes,

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
