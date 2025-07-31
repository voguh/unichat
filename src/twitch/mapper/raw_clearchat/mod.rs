/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use irc::client::prelude::*;

use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_CLEAR_TYPE;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_AUTHOR_TYPE;
use crate::twitch::mapper::structs::parse_tags;

pub fn parse(channel: String, message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let event: UniChatEvent;
    let tags = parse_tags(&message.tags);

    let room_id = tags.get("room-id").ok_or("Missing room-id tag")?;
    let timestamp_usec = tags.get("tmi-sent-ts").ok_or("Missing or invalid tmi-sent-ts tag")?;
    let timestamp_usec: i64 = timestamp_usec.parse()?;

    if let Some(target_user_id) = tags.get("target-user-id") {
        event = UniChatEvent::RemoveAuthor {
            event_type: String::from(UNICHAT_EVENT_REMOVE_AUTHOR_TYPE),
            data: UniChatRemoveAuthorEventPayload {
                channel_id: room_id.to_owned(),
                channel_name: Some(channel),
                platform: UniChatPlatform::Twitch,

                author_id: target_user_id.to_owned(),

                timestamp: timestamp_usec
            }
        };
    } else {
        event = UniChatEvent::Clear {
            event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
            data: UniChatClearEventPayload {
                platform: Some(UniChatPlatform::Twitch),

                timestamp: timestamp_usec
            }
        };
    }

    return Ok(Some(event));
}
