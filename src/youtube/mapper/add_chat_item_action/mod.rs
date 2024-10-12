use crate::events::unichat::UniChatEvent;

mod live_chat_text_message_renderer;

pub fn parse(value: &serde_json::Value) -> Option<UniChatEvent> {
    let mut event: Option<UniChatEvent> = None;
    let item = value.get("item").unwrap();

    if let Some(value) = item.get("liveChatTextMessageRenderer") {
        event = live_chat_text_message_renderer::parse(value.clone())
    }

    event
}
