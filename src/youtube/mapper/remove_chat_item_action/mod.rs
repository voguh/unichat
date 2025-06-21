use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRemoveMessageEventPayload;
use crate::events::unichat::UNICHAT_EVENT_REMOVE_MESSAGE_TYPE;
use crate::utils::parse_serde_error;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemAction {
    target_item_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: RemoveChatItemAction = serde_json::from_value(value).map_err(parse_serde_error)?;

    let event = UniChatEvent::RemoveMessage {
        event_type: String::from(UNICHAT_EVENT_REMOVE_MESSAGE_TYPE),
        data: UniChatRemoveMessageEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            message_id: parsed.target_item_id.clone()
        }
    };

    return Ok(Some(event));
}
