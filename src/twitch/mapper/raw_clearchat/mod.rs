/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::irc::IRCMessage;
use crate::utils::get_current_timestamp;

pub fn parse(channel: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let event: UniChatEvent;
    let tags = message.tags.clone();

    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or(anyhow!("Missing room-id tag"))?;
    let timestamp_usec = get_current_timestamp()?;

    if let Some(target_user_id) = tags.get("target-user-id").and_then(|v| v.as_ref()) {
        event = UniChatEvent::RemoveAuthor(UniChatRemoveAuthorEventPayload {
            channel_id: room_id.to_owned(),
            channel_name: Some(channel),

            platform: UniChatPlatform::Twitch,
            flags: HashMap::new(),

            author_id: target_user_id.to_owned(),

            timestamp: timestamp_usec
        });
    } else {
        event = UniChatEvent::Clear(UniChatClearEventPayload {
            platform: Some(UniChatPlatform::Twitch),

            timestamp: timestamp_usec
        });
    }

    return Ok(Some(event));
}
