use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatMessageEventPayload};
use crate::youtube::mapper::{AuthorName, ThumbnailsWrapper};

use super::{build_author_badges, build_emotes, build_message, get_author_color, get_author_type, LiveChatAuthorBadgeRenderer, Message};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatTextMessageRenderer {
    id: String,
    message: Message,
    author_external_channel_id: String,
    author_name: AuthorName,
    author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>,
    author_photo: ThumbnailsWrapper,
    timestamp_usec: String
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    match serde_json::from_value::<LiveChatTextMessageRenderer>(value) {
        Ok(parsed) => {
            Ok(Some(UniChatEvent::Message {
                event_type: String::from("unichat:message"),
                detail: UniChatMessageEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.author_external_channel_id,
                    author_username: None,
                    author_display_name: parsed.author_name.simple_text,
                    author_display_color: get_author_color(&parsed.author_badges),
                    author_badges: build_author_badges(&parsed.author_badges),
                    author_profile_picture_url: parsed.author_photo.thumbnails.last().unwrap().url.clone(),
                    author_type: get_author_type(&parsed.author_badges),

                    message_id: parsed.id,
                    message_text: build_message(&parsed.message.runs),
                    emotes: build_emotes(&parsed.message.runs)
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
