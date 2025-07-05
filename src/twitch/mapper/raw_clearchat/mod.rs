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

use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_CLEAR_TYPE;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_AUTHOR_TYPE;
use crate::twitch::mapper::structs::parse_tags;

pub fn parse(channel: String, message: &Message) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let event: UniChatEvent;
    let tags = parse_tags(&message.tags);

    let room_id = tags.get("room-id").ok_or("Missing room-id tag")?;

    if let Some(target_user_id) = tags.get("target-user-id") {
        event = UniChatEvent::RemoveAuthor {
            event_type: String::from(UNICHAT_EVENT_REMOVE_AUTHOR_TYPE),
            data: UniChatRemoveAuthorEventPayload {
                channel_id: room_id.to_owned(),
                channel_name: Some(channel),
                platform: UniChatPlatform::Twitch,

                author_id: target_user_id.to_owned()
            }
        };
    } else {
        event = UniChatEvent::Clear {
            event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
            data: UniChatClearEventPayload {
                platform: Some(UniChatPlatform::Twitch)
            }
        };
    }

    return Ok(Some(event));
}
