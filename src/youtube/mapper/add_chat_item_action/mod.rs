use crate::events::unichat::UniChatEvent;

mod live_chat_text_message_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    let item = value.get("item").unwrap();

    if let Some(value) = item.get("liveChatTextMessageRenderer") {
        live_chat_text_message_renderer::parse(value.clone())
    } else {
        Ok(None)
    }
}
