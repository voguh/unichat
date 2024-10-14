use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEmote, UniChatEvent};

use super::{AuthorBadge, ThumbnailsWrapper};

mod live_chat_membership_item_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LiveChatAuthorBadgeRenderer {
    #[serde(rename = "liveChatAuthorBadgeRenderer")]
    renderer: AuthorBadge
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Message {
    runs: Vec<MessageRun>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MessageRun {
    text: Option<String>,
    emoji: Option<MessageRunEmoji>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MessageRunEmoji {
    emoji_id: String,
    is_custom_emoji: Option<bool>,
    search_terms: Option<Vec<String>>,
    shortcuts: Option<Vec<String>>,
    image: ThumbnailsWrapper
}

/* <============================================================================================> */

fn get_emoji_type(emoji: &MessageRunEmoji) -> String {
    if let Some(search_terms) = &emoji.search_terms {
        search_terms.first().unwrap().clone()
    } else {
        emoji.emoji_id.clone()
    }
}

fn build_message(runs: &Vec<MessageRun>) -> String {
    let mut str_message = Vec::new();

    for run in runs {
        if let Some(text) = &run.text {
            str_message.push(text.clone());
        } else if let Some(emoji) = &run.emoji {
            str_message.push(get_emoji_type(emoji))
        }
    }

    str_message.join(" ")
}

fn build_emotes(runs: &Vec<MessageRun>) -> Vec<UniChatEmote> {
    let mut emotes = Vec::new();

    for run in runs {
        if let Some(emoji) = &run.emoji {
            emotes.push(UniChatEmote {
                emote_type: get_emoji_type(emoji),
                tooltip: get_emoji_type(emoji),
                url: emoji.image.thumbnails.last().unwrap().url.clone()
            });
        }
    }

    emotes
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
