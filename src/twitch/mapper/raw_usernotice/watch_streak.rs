/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::error::Error;
use crate::events::unichat::UNICHAT_FLAG_TWITCH_STREAK_DAYS;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::irc::IRCCommand;
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

pub fn parse(message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();
    let mut channel: Option<String> = None;
    let mut text: Option<String> = None;
    if let IRCCommand::Raw(cmd, args) = &message.command {
        if cmd != "USERNOTICE" {
            return Err(Error::from("Invalid command for USERNOTICE message"));
        }

        if args.len() < 2 {
            return Err(Error::from("Insufficient arguments for USERNOTICE message"));
        }

        channel = Some(args[0].strip_prefix("#").unwrap_or(&args[0]).to_string());
        text = Some(args[1].clone());
    }

    let text = text.ok_or("Missing message text")?;

    let room_id = tags.get("room-id").and_then(|v| v.to_owned()).ok_or("Missing room-id tag")?;
    let channel = channel.ok_or("Missing channel name")?;
    let mut flags = inject_raw_tags(&tags);
    let author_id = tags.get("user-id").and_then(|v| v.to_owned()).ok_or("Missing user-id tag")?;
    let author_username = parse_author_username(&message.prefix)?;
    let author_name = parse_author_name(tags.get("display-name"))?;
    let author_color = parse_author_color(tags.get("color"), &author_username)?;
    let author_badges = parse_author_badges(tags.get("badges"))?;
    let author_type = parse_author_type(&tags)?;
    let message_id = tags.get("id").and_then(|v| v.to_owned()).ok_or("Missing id tag")?;
    let message = parse_message_string(&text)?;
    let emotes = parse_message_emotes(tags.get("emotes"), &text)?;
    let timestamp_usec = get_current_timestamp()?;

    let streak_days = tags.get("msg-param-value").and_then(|v| v.to_owned()).ok_or("Missing msg-param-value tag")?;
    flags.insert(String::from(UNICHAT_FLAG_TWITCH_STREAK_DAYS), Some(streak_days));

    let event = UniChatEvent::Message(UniChatMessageEventPayload {
        channel_id: room_id.to_owned(),
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: flags,

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
    });

    return Ok(Some(event));
}
