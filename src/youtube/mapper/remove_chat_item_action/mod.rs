use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRemoveMessageEventPayload;
use crate::youtube::mapper::serde_error_parse;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemAction {
    target_item_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: RemoveChatItemAction = serde_json::from_value(value).map_err(serde_error_parse)?;

    let event = UniChatEvent::RemoveMessage {
        event_type: String::from("unichat:remove_message"),
        data: UniChatRemoveMessageEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            message_id: parsed.target_item_id.clone()
        }
    };

    return Ok(Some(event));
}
