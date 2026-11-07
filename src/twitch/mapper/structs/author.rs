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
use anyhow::anyhow;
use serde::Deserialize;

use crate::events::UniChatAuthorType;
use crate::events::UniChatBadge;
use crate::twitch::irc::IRCPrefix;
use crate::twitch::read_badges;
use crate::utils::random_color_by_seed;

/* ========================================================================== */

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TwitchRawBadge {
    #[serde(rename = "setID")]
    pub set_id: String,
    pub version: String,
    pub image_4x: String
}

/* ========================================================================== */

pub fn parse_author_username(prefix: &Option<IRCPrefix>) -> Option<String> {
    if let Some(IRCPrefix::Nick(_, username, _)) = prefix {
        return Some(username.clone());
    }

    return None;
}

pub fn parse_author_color(color: Option<String>, author_username: &Option<String>) -> Result<String, Error> {
    if let Some(color) = color {
        return Ok(color);
    } else if let Some(author_username) = author_username {
        return Ok(random_color_by_seed(author_username));
    }

    return Err(anyhow!("Missing author name"));
}

pub fn parse_author_badges(badges: Option<String>) -> Vec<UniChatBadge> {
    let mut parsed_badges = Vec::new();
    if let Some(badge_str) = badges {
        let twitch_badges = read_badges();
        for badge in badge_str.split(',') {
            let global_badge = format!("global/{}", badge);
            if let Some(twitch_badge) = twitch_badges.get(badge).or_else(|| twitch_badges.get(&global_badge)) {
                parsed_badges.push(twitch_badge.to_owned());
            }
        }
    }

    return parsed_badges;
}

pub fn parse_author_type(tags: &HashMap<String, Option<String>>) -> UniChatAuthorType {
    let mut author_type = UniChatAuthorType::Viewer;

    if let Some(value) = tags.get("badges").and_then(|v| v.as_ref()) {
        if value.contains("broadcaster") {
            author_type = UniChatAuthorType::Broadcaster;
        } else if value.contains("moderator") {
            author_type = UniChatAuthorType::Moderator;
        } else if value.contains("subscriber") {
            author_type = UniChatAuthorType::Sponsor;
        }
    }

    return author_type;
}
