/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::error::Error;
use crate::events::unichat::UniChatEvent;
use crate::irc::IRCMessage;

mod announcement;
mod community_gift;
mod raid;
mod subgift;
mod subscription;

pub fn parse(channel_name: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    let msg_id = tags.get("msg-id").and_then(|v| v.as_ref()).ok_or("Missing msg-id tag")?;

    if msg_id == "announcement" {
        return announcement::parse(message, &tags);
    } else if msg_id == "submysterygift" {
        return community_gift::parse(channel_name, &tags);
    } else if msg_id == "raid" {
        return raid::parse(channel_name, &tags);
    } else if msg_id == "subgift" && tags.get("msg-param-community-gift-id").is_none() {
        return subgift::parse(channel_name, &tags);
    } else if msg_id == "sub" || msg_id == "resub" {
        return subscription::parse(message, &tags);
    }

    return Ok(None);
}
