/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use anyhow::anyhow;

use crate::events::UniChatEvent;
use crate::twitch::mapper::get_tag;
use crate::twitch::mapper::require_tag;
use crate::utils::irc::IRCCommand;
use crate::utils::irc::IRCMessage;

mod announcement;
mod community_gift;
mod raid;
mod subgift;
mod subscription;
mod watch_streak;

/* ========================================================================== */

fn parse_command(message: &IRCMessage) -> Result<(String, Option<String>), Error> {
    return match &message.command {
        IRCCommand::Raw(_, payload) => Ok((payload[0].clone(), payload.get(1).cloned())),
        _ => Err(anyhow!("Invalid message command type"))
    };
}

pub fn parse(channel_name: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    let msg_id = require_tag(&tags, "msg-id")?;
    let msg_category = get_tag(&tags, "msg-param-category").unwrap_or_default();

    if msg_id == "announcement" {
        return announcement::parse(message, &tags);
    } else if msg_id == "submysterygift" {
        return community_gift::parse(channel_name, &tags);
    } else if msg_id == "raid" {
        return raid::parse(channel_name, &tags);
    } else if msg_id == "subgift" && !tags.contains_key("msg-param-community-gift-id") {
        return subgift::parse(channel_name, &tags);
    } else if msg_id == "sub" || msg_id == "resub" {
        return subscription::parse(message, &tags);
    } else if msg_id == "viewermilestone" && msg_category == "watch-streak" {
        return watch_streak::parse(message);
    }

    return Ok(None);
}
