use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Option<UniChatEvent> {
    let mut event: Option<UniChatEvent> = None;
    let banner_renderer = value.get("bannerRenderer").unwrap();

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        event = live_chat_banner_renderer::parse(value.clone())
    }

    event
}
