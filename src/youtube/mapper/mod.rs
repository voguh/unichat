use crate::events::unichat::UniChatEvent;

mod add_banner_to_live_chat_command;
mod add_chat_item_action;
mod remove_chat_item_action;
mod remove_chat_item_by_author_action;
pub mod structs;

pub fn parse(payload: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    if let Some(value) = payload.get("addChatItemAction") {
        return add_chat_item_action::parse(value);
    } else if let Some(value) = payload.get("removeChatItemAction") {
        return remove_chat_item_action::parse(value.clone());
    } else if let Some(value) = payload.get("removeChatItemByAuthorAction") {
        return remove_chat_item_by_author_action::parse(value.clone());
    } else if let Some(value) = payload.get("addBannerToLiveChatCommand") {
        return add_banner_to_live_chat_command::parse(value);
    } else {
        return Ok(None);
    }
}
