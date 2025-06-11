use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatRaidEventPayload};
use crate::youtube::mapper::ThumbnailsWrapper;

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
    author_photo: ThumbnailsWrapper,
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

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {

    match serde_json::from_value::<LiveChatBannerRenderer>(value)  {
        Ok(parsed) => {
            let mut event: Option<UniChatEvent> = None;

            if parsed.banner_type == "LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT" {
                if let Some(renderer) = parsed.contents.live_chat_banner_redirect_renderer {
                    let first_run = renderer.banner_message.runs.first().unwrap();

                    if first_run.bold.is_some() {
                        event = Some(UniChatEvent::Raid {
                            event_type: String::from("unichat:raid"),
                            data: UniChatRaidEventPayload {
                                channel_id: None,
                                channel_name: None,
                                platform: String::from("youtube"),

                                author_id: None,
                                author_username: None,
                                author_display_name: String::from(first_run.text.trim()),
                                author_profile_picture_url: renderer.author_photo.thumbnails.last().unwrap().url.clone(),

                                viewer_count: None
                            }
                        })
                    }
                }
            }

            Ok(event)
        }

        Err(err) => {
            Err(err)
        }
    }
}
