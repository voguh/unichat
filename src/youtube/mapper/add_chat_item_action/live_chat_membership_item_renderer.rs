use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatSponsorEvent};
use crate::youtube::mapper::{AuthorName, ThumbnailsWrapper};

use super::LiveChatAuthorBadgeRenderer;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatMembershipItemRenderer {
    pub id: String,

    pub header_subtext: RunsWrapper,

    pub author_external_channel_id: String,
    pub author_name: AuthorName,
    pub author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>,
    pub author_photo: ThumbnailsWrapper,

    pub timestamp_usec: String
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
    match serde_json::from_value::<LiveChatMembershipItemRenderer>(value) {
        Ok(parsed) => {
            Ok(Some(UniChatEvent::Sponsor {
                event_type: String::from("unichat:sponsor"),
                detail: UniChatSponsorEvent {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.author_external_channel_id.clone(),
                    author_username: None,
                    author_display_name: parsed.author_name.simple_text.clone(),
                    author_profile_picture_url: parsed.author_photo.thumbnails.last().unwrap().url.clone(),

                    tier: String::from(parsed.header_subtext.runs.get(1).unwrap().text.trim()),
                    months: None
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
