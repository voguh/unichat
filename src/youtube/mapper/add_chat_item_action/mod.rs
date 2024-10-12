use serde::{Deserialize, Serialize};

use crate::events::unichat::UniChatEvent;

use super::AuthorBadges;

mod live_chat_membership_item_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LiveChatAuthorBadgeRenderer {
    #[serde(rename = "liveChatAuthorBadgeRenderer")]
    renderer: AuthorBadges
}

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    let item = value.get("item").unwrap();

    if let Some(value) = item.get("liveChatTextMessageRenderer") {
        live_chat_text_message_renderer::parse(value.clone())
    } else if let Some(value) = item.get("liveChatMembershipItemRenderer") {
        live_chat_membership_item_renderer::parse(value.clone())
    } else if let Some(value) = item.get("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer") {
        live_chat_sponsorships_gift_purchase_announcement_renderer::parse(value.clone())
    } else {
        Ok(None)
    }
}
