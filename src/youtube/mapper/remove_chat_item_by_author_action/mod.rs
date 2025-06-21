use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_AUTHOR_TYPE;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: RemoveChatItemByAuthorAction = serde_json::from_value(value).map_err(parse_serde_error)?;

    let event = UniChatEvent::RemoveAuthor {
        event_type: String::from(UNICHAT_EVENT_REMOVE_AUTHOR_TYPE),
        data: UniChatRemoveAuthorEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            author_id: parsed.external_channel_id.clone()
        }
    };

    return Ok(Some(event));
}
