/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::twitch::mapper::structs::inject_raw_tags;
use crate::utils::get_current_timestamp;
use crate::utils::irc::IRCMessage;

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
            flags: inject_raw_tags(&tags),

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
