/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::events::unichat::UniChatEvent;

mod live_chat_membership_item_renderer;
mod live_chat_paid_message_renderer;
mod live_chat_paid_sticker_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let item = value.get("item").ok_or("No item found in value")?;

    if let Some(value) = item.get("liveChatMembershipItemRenderer") {
        return live_chat_membership_item_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatPaidMessageRenderer") {
        return live_chat_paid_message_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatPaidStickerRenderer") {
        return live_chat_paid_sticker_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer") {
        return live_chat_sponsorships_gift_purchase_announcement_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatTextMessageRenderer") {
        return live_chat_text_message_renderer::parse(value.clone());
    }

    return Ok(None);
}
