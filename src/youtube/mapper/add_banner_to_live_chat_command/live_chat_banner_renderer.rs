use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRaidEventPayload;
use crate::events::unichat::UNICHAT_EVENT_RAID_TYPE;
use crate::utils::parse_serde_error;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRenderer {
    action_id: String,
    banner_type: String,
    target_id: String,
    is_stackable: bool,
    contents: LiveChatBannerRedirectRendererWrapper
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRedirectRendererWrapper {
    live_chat_banner_redirect_renderer: Option<LiveChatBannerRedirectRenderer>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatBannerRedirectRenderer {
    author_photo: AuthorPhotoThumbnailsWrapper,
    banner_message: BannerMessage
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BannerMessage {
    runs: Vec<BannerMessageRuns>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BannerMessageRuns {
    text: String,
    bold: Option<bool>,
    font_face: Option<String>,
    text_color: Option<u32>
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatBannerRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let mut event: Option<UniChatEvent> = None;

    if parsed.banner_type == "LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT" {
        if let Some(renderer) = parsed.contents.live_chat_banner_redirect_renderer {
            let first_run = renderer.banner_message.runs.first().ok_or("No runs found in banner message")?;
            let author_photo = renderer.author_photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;

            if first_run.bold.is_some() {
                event = Some(UniChatEvent::Raid {
                    event_type: String::from(UNICHAT_EVENT_RAID_TYPE),
                    data: UniChatRaidEventPayload {
                        channel_id: None,
                        channel_name: None,
                        platform: String::from("youtube"),

                        author_id: None,
                        author_username: None,
                        author_display_name: String::from(first_run.text.trim()),
                        author_profile_picture_url: author_photo.url.clone(),

                        viewer_count: None
                    }
                })
            }
        }
    }

    return Ok(event);
}
