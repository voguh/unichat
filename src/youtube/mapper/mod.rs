use serde::{Deserialize, Serialize};

use crate::events::unichat::UniChatEvent;

mod add_banner_to_live_chat_command;
mod add_chat_item_action;
mod remove_chat_item_action;
mod remove_chat_item_by_author_action;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AuthorName {
    pub simple_text: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AuthorBadges {
    pub tooltip: String,
    pub icon: Option<StandardIcon>,
    pub custom_thumbnail: Option<ThumbnailsWrapper>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct StandardIcon {
    pub icon_type: String
}

/* <============================================================================================> */

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailsWrapper {
    pub thumbnails: Vec<Thumbnail>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Thumbnail {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub url: String
}

/* <============================================================================================> */

pub fn parse(payload: serde_json::Value) -> Option<UniChatEvent> {
    let mut event: Option<UniChatEvent> = None;

    if let Some(value) = payload.get("addChatItemAction") {
        event = add_chat_item_action::parse(value)
    } else if let Some(value) = payload.get("removeChatItemAction") {
        event = remove_chat_item_action::parse(value.clone())
    } else if let Some(value) = payload.get("removeChatItemByAuthorAction") {
        event = remove_chat_item_by_author_action::parse(value.clone())
    } else if let Some(value) = payload.get("addBannerToLiveChatCommand") {
        event = add_banner_to_live_chat_command::parse(value)
    }

    event
}
