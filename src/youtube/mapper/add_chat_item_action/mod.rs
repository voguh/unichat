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

use crate::events::unichat::UniChatEvent;

mod live_chat_membership_item_renderer;
mod live_chat_paid_message_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let item = value.get("item").ok_or("No item found in value")?;

    if let Some(value) = item.get("liveChatMembershipItemRenderer") {
        return live_chat_membership_item_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatPaidMessageRenderer") {
        return live_chat_paid_message_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer") {
        return live_chat_sponsorships_gift_purchase_announcement_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatTextMessageRenderer") {
        return live_chat_text_message_renderer::parse(value.clone());
    }

    return Ok(None);
}
