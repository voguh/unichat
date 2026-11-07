/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::Error;

use crate::events::UniChatEvent;
use crate::twitch::mapper::get_tag;
use crate::twitch::mapper::require_tag;

mod announcement;
mod community_gift;
mod raid;
mod subgift;
mod subscription;
mod watch_streak;

/* ========================================================================== */

pub fn parse(
    channel_name: String,
    text: Option<&str>,
    tags: &HashMap<String, Option<String>>
) -> Result<Option<UniChatEvent>, Error> {
    let msg_id = require_tag(tags, "msg-id")?;
    let msg_category = get_tag(tags, "msg-param-category").unwrap_or_default();

    if msg_id == "announcement" {
        return announcement::parse(channel_name, text, tags);
    } else if msg_id == "submysterygift" {
        return community_gift::parse(channel_name, tags);
    } else if msg_id == "raid" {
        return raid::parse(channel_name, tags);
    } else if msg_id == "subgift" && !tags.contains_key("msg-param-community-gift-id") {
        return subgift::parse(channel_name, tags);
    } else if msg_id == "sub" || msg_id == "resub" {
        return subscription::parse(channel_name, text, tags);
    } else if msg_id == "viewermilestone" && msg_category == "watch-streak" {
        return watch_streak::parse(channel_name, text, tags);
    }

    return Ok(None);
}
