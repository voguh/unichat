use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    let banner_renderer = value.get("bannerRenderer").unwrap();

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        live_chat_banner_renderer::parse(value.clone())
    } else {
        Ok(None)
    }
}
