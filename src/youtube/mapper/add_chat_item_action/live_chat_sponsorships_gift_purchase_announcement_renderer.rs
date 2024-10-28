use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatSponsorGiftEventPayload};
use crate::youtube::mapper::{AuthorName, ThumbnailsWrapper};

use super::LiveChatAuthorBadgeRenderer;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
    pub id: String,

    pub author_external_channel_id: String,

    pub header: Header,

    pub timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Header {
    live_chat_sponsorships_header_renderer: LiveChatSponsorshipsHeaderRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsHeaderRenderer {
    pub primary_text: RunsWrapper,

    pub image: ThumbnailsWrapper,

    pub author_name: AuthorName,
    pub author_photo: ThumbnailsWrapper,
    pub author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RunsWrapper {
    pub runs: Vec<Run>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Run {
    pub text: String
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    match serde_json::from_value::<LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer>(value) {
        Ok(parsed) => {
            let render = parsed.header.live_chat_sponsorships_header_renderer;

            Ok(Some(UniChatEvent::SponsorGift {
                event_type: String::from("unichat:sponsor_gift"),
                detail: UniChatSponsorGiftEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.author_external_channel_id.clone(),
                    author_username: None,
                    author_display_name: render.author_name.simple_text.clone(),
                    author_profile_picture_url: render.author_photo.thumbnails.last().unwrap().url.clone(),

                    tier: String::from(render.primary_text.runs.get(3).unwrap().text.trim()),
                    count: render.primary_text.runs.get(1).unwrap().text.parse().unwrap()
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
