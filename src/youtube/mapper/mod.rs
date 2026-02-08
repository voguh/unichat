/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;

use crate::events::unichat::UniChatEvent;

mod add_banner_to_live_chat_command;
mod add_chat_item_action;
mod remove_chat_item_action;
mod remove_chat_item_by_author_action;
pub mod structs;

pub fn parse(payload: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
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
