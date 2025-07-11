/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use irc::client::prelude::*;

use crate::events::unichat::UniChatEvent;
use crate::twitch::mapper::structs::parse_tags;

mod announcement;
mod community_gift;
mod raid;
mod subgift;
mod subscription;

pub fn parse(channel_name: String, message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let tags = parse_tags(&message.tags);

    let msg_id = tags.get("msg-id").ok_or("Missing msg-id tag")?;

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
