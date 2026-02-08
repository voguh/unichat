/*!******************************************************************************
 * UniChat
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

use crate::events::unichat::UniChatEvent;
use crate::utils::irc::IRCMessage;

mod announcement;
mod community_gift;
mod raid;
mod subgift;
mod subscription;
mod watch_streak;

pub fn parse(channel_name: String, message: &IRCMessage) -> Result<Option<UniChatEvent>, Error> {
    let tags = message.tags.clone();

    let msg_id = tags.get("msg-id").and_then(|v| v.to_owned()).ok_or(anyhow!("Missing msg-id tag"))?;
    let msg_category = tags.get("msg-param-category").and_then(|v| v.to_owned()).unwrap_or_default();

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
    } else if msg_id == "viewermilestone" && msg_category == "watch-streak" {
        return watch_streak::parse(message);
    }

    return Ok(None);
}
