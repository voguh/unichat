use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatRemoveAuthorEventPayload;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RemoveChatItemByAuthorAction {
    external_channel_id: String
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    match serde_json::from_value::<RemoveChatItemByAuthorAction>(value) {
        Ok(parsed) => {
            Ok(Some(UniChatEvent::RemoveAuthor {
                event_type: String::from("unichat:remove_author"),
                data: UniChatRemoveAuthorEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.external_channel_id.clone()
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
