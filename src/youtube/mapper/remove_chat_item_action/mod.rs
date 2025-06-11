use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRemoveMessageEventPayload;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemAction {
    target_item_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    match serde_json::from_value::<RemoveChatItemAction>(value) {
        Ok(parsed) => {
            Ok(Some(UniChatEvent::RemoveMessage {
                event_type: String::from("unichat:remove_message"),
                data: UniChatRemoveMessageEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    message_id: parsed.target_item_id.clone()
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
