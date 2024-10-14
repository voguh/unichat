use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatEvent, UniChatSponsorEvent};
use crate::youtube::mapper::{AuthorName, ThumbnailsWrapper};

use super::{build_message, LiveChatAuthorBadgeRenderer, Message, MessageRun};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatMembershipItemRenderer {
    pub id: String,

    pub header_primary_text: Option<HeaderPrimaryText>,
    pub header_subtext: HeaderSubtext,
    pub message: Option<Message>,

    pub author_external_channel_id: String,
    pub author_name: AuthorName,
    pub author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>,
    pub author_photo: ThumbnailsWrapper,

    pub timestamp_usec: String
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct HeaderPrimaryText {
    pub runs: Vec<MessageRun>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct HeaderSubtext {
    pub simple_text: Option<String>,
    pub runs: Option<Vec<MessageRun>>
}

/* <============================================================================================> */

fn parse_tier(parsed: &LiveChatMembershipItemRenderer) -> String {
    let mut tier = String::from("");

    if let Some(_header_primary_text) = &parsed.header_primary_text {
        if let Some(simple_text) = &parsed.header_subtext.simple_text {
            tier =  simple_text.trim().to_string();
        }
    } else if let Some(runs) = &parsed.header_subtext.runs {
        if let Some(text) = &runs.get(1).unwrap().text {
            tier = text.trim().to_string();
        }
    }

    tier
}


// I was able to detect two types of membership events (examples 7 and 8).
// The event without a message and with 'runs' in the headerSubtext I am assuming is the first month
// of membership. On the other hand, the event where the 'runs' is in the headerPrimaryText contains
// information that allows detecting the number of months of the membership.
fn parse_months(parsed: &LiveChatMembershipItemRenderer) -> u16 {
    let mut months: u16 = 0;

    if let Some(header_primary_text) = &parsed.header_primary_text {
        if let Some(text) = &header_primary_text.runs.get(1).unwrap().text {
            months =  text.trim().to_string().parse().unwrap();
        }
    } else if let Some(_runs) = &parsed.header_subtext.runs {
        months = 1
    }

    months
}

fn optional_build_message(message: &Option<Message>) -> Option<String> {
    if let Some(message) = message {
        Some(build_message(&message.runs))
    } else {
        None
    }
}

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

                    tier: parse_tier(&parsed),
                    months: parse_months(&parsed),
                    message: optional_build_message(&parsed.message)
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
