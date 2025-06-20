use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatMessageEventPayload;
use crate::youtube::mapper::add_chat_item_action::build_author_badges;
use crate::youtube::mapper::add_chat_item_action::build_emotes;
use crate::youtube::mapper::add_chat_item_action::build_message;
use crate::youtube::mapper::add_chat_item_action::get_author_color;
use crate::youtube::mapper::add_chat_item_action::get_author_type;
use crate::youtube::mapper::add_chat_item_action::LiveChatAuthorBadgeRenderer;
use crate::youtube::mapper::add_chat_item_action::Message;
use crate::youtube::mapper::serde_error_parse;
use crate::youtube::mapper::AuthorName;
use crate::youtube::mapper::ThumbnailsWrapper;

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

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatTextMessageRenderer = serde_json::from_value(value).map_err(serde_error_parse)?;
    let author_badges = build_author_badges(&parsed.author_badges)?;
    let author_photo = parsed.author_photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;
    let message = build_message(&parsed.message.runs)?;
    let emotes = build_emotes(&parsed.message.runs)?;

    let event = UniChatEvent::Message {
        event_type: String::from("unichat:message"),
        data: UniChatMessageEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            author_id: parsed.author_external_channel_id,
            author_username: None,
            author_display_name: parsed.author_name.simple_text,
            author_display_color: get_author_color(&parsed.author_badges),
            author_badges: author_badges,
            author_profile_picture_url: author_photo.url.clone(),
            author_type: get_author_type(&parsed.author_badges),

            message_id: parsed.id,
            message_text: message,
            emotes: emotes
        }
    };

    return Ok(Some(event));
}
