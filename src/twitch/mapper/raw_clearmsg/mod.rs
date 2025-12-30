/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveMessageEventPayload;
use crate::irc::IRCMessage;

pub fn parse(channel: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or(anyhow::anyhow!("Missing room-id tag"))?;
    let target_msg_id = tags.get("target-msg-id").and_then(|v| v.as_ref()).ok_or(anyhow::anyhow!("Missing target-msg-id tag"))?;
    let timestamp_usec = tags.get("tmi-sent-ts").and_then(|v| v.as_ref()).ok_or(anyhow::anyhow!("Missing or invalid tmi-sent-ts tag"))?;
    let timestamp_usec: i64 = timestamp_usec.parse()?;

    let event = UniChatEvent::RemoveMessage(UniChatRemoveMessageEventPayload {
        channel_id: room_id.to_owned(),
        channel_name: Some(channel),
        platform: UniChatPlatform::Twitch,

        message_id: target_msg_id.to_owned(),

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
