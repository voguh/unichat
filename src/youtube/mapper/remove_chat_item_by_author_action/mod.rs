use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatRemoveAuthorEventPayload};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: serde_json::Value) -> Option<UniChatEvent> {
    let mut event: Option<UniChatEvent> = None;

    match serde_json::from_value::<RemoveChatItemByAuthorAction>(value) {
        Ok(parsed) => {
            event = Some(UniChatEvent::RemoveAuthor {
                event_type: String::from("unichat:remove_message"),
                detail: UniChatRemoveAuthorEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.external_channel_id.clone()
                }
            })
        }

        Err(err) => {
            eprintln!("error: {:?}", err)
        }
    }

    event
}
