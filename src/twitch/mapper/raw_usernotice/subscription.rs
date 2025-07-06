/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::collections::HashMap;

use irc::client::prelude::*;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_SPONSOR_TYPE;
use crate::twitch::mapper::structs::author::parse_author_badges;
use crate::twitch::mapper::structs::author::parse_author_color;
use crate::twitch::mapper::structs::author::parse_author_name;
use crate::twitch::mapper::structs::author::parse_author_type;
use crate::twitch::mapper::structs::author::parse_author_username_str;
use crate::twitch::mapper::structs::message::parse_message_emotes;
use crate::twitch::mapper::structs::message::parse_message_string;

pub fn parse(message: &Message, tags: &HashMap<String, String>) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let (channel, message_text) = match &message.command {
        Command::Raw(_, payload) => Ok((payload[0].clone(), payload.get(1))),
        _ => Err("Invalid message command type")
    }?;

    let room_id = tags.get("room-id").ok_or("Missing room-id tag")?;
    let author_id = tags.get("user-id").ok_or("Missing user-id tag")?;
    let author_username = parse_author_username_str(tags.get("login"))?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let tier = tags.get("msg-param-sub-plan").ok_or("Missing msg-param-sub-plan tag")?;
    let months_str = tags.get("msg-param-months").ok_or("Missing msg-param-months tag")?;
    let months: u16 = months_str.parse()?;
    let message_id = tags.get("id").ok_or("Missing id tag")?;
    let message = message_text.and_then(|text| parse_message_string(text).ok());
    let emotes = parse_message_emotes(tags.get("emotes"), &message.clone().unwrap_or_default())?;
    let timestamp_usec = tags.get("tmi-sent-ts").ok_or("Missing or invalid tmi-sent-ts tag")?;
    let timestamp_usec: i64 = timestamp_usec.parse()?;

    let event = UniChatEvent::Sponsor {
        event_type: String::from(UNICHAT_EVENT_SPONSOR_TYPE),
        data: UniChatSponsorEventPayload {
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

            tier: Some(tier.to_owned()),
            months: months,

            message_id: message_id.to_owned(),
            message_text: message.clone(),
            emotes: emotes,

            timestamp: timestamp_usec
        }
    };

    return Ok(Some(event));
}
