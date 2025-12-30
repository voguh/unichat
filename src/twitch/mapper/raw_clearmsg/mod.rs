/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::Error;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveMessageEventPayload;
use crate::irc::IRCMessage;
use crate::utils::get_current_timestamp;

pub fn parse(channel: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    let room_id = tags.get("room-id").and_then(|v| v.as_ref()).ok_or(anyhow::anyhow!("Missing room-id tag"))?;
    let target_msg_id = tags.get("target-msg-id").and_then(|v| v.as_ref()).ok_or(anyhow::anyhow!("Missing target-msg-id tag"))?;
    let timestamp_usec = get_current_timestamp()?;

    let event = UniChatEvent::RemoveMessage(UniChatRemoveMessageEventPayload {
        channel_id: room_id.to_owned(),
        channel_name: Some(channel),

        platform: UniChatPlatform::Twitch,
        flags: HashMap::new(),

        message_id: target_msg_id.to_owned(),

        timestamp: timestamp_usec
    });

    return Ok(Some(event));
}
