/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
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

mod live_chat_membership_item_renderer;
mod live_chat_paid_message_renderer;
mod live_chat_paid_sticker_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let item = value.get("item").ok_or(anyhow!("No item found in value"))?;

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
