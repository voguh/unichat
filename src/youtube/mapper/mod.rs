/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
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

use crate::events::unichat::UniChatEvent;

mod add_banner_to_live_chat_command;
mod add_chat_item_action;
mod remove_chat_item_action;
mod remove_chat_item_by_author_action;
pub mod structs;

pub fn parse(payload: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    if let Some(value) = payload.get("addBannerToLiveChatCommand") {
        return add_banner_to_live_chat_command::parse(value);
    } else if let Some(value) = payload.get("addChatItemAction") {
        return add_chat_item_action::parse(value);
    } else if let Some(value) = payload.get("removeChatItemAction") {
        return remove_chat_item_action::parse(value.clone());
    } else if let Some(value) = payload.get("removeChatItemByAuthorAction") {
        return remove_chat_item_by_author_action::parse(value.clone());
    }

    return Ok(None);
}
