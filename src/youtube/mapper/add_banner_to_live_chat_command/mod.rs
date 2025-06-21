use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let banner_renderer = value.get("bannerRenderer").ok_or("No bannerRenderer found")?;

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        return live_chat_banner_renderer::parse(value.clone())
    }

    return Ok(None);
}
