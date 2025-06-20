use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatSponsorEventPayload;
use crate::youtube::mapper::add_chat_item_action::build_message;
use crate::youtube::mapper::add_chat_item_action::LiveChatAuthorBadgeRenderer;
use crate::youtube::mapper::add_chat_item_action::Message;
use crate::youtube::mapper::add_chat_item_action::MessageRun;
use crate::youtube::mapper::serde_error_parse;
use crate::youtube::mapper::AuthorName;
use crate::youtube::mapper::ThumbnailsWrapper;

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

fn parse_tier(parsed: &LiveChatMembershipItemRenderer) -> Result<String, Box<dyn std::error::Error>> {
    let mut tier = String::from("");

    if let Some(_header_primary_text) = &parsed.header_primary_text {
        if let Some(simple_text) = &parsed.header_subtext.simple_text {
            tier =  simple_text.trim().to_string();
        }
    } else if let Some(runs) = &parsed.header_subtext.runs {
        let run = runs.get(1).ok_or("No second run found in header subtext")?;
        if let Some(text) = &run.text {
            tier = text.trim().to_string();
        }
    }

    return Ok(tier);
}


// I was able to detect two types of membership events (examples 7 and 8).
// The event without a message and with 'runs' in the headerSubtext I am assuming is the first month
// of membership. On the other hand, the event where the 'runs' is in the headerPrimaryText contains
// information that allows detecting the number of months of the membership.
fn parse_months(parsed: &LiveChatMembershipItemRenderer) -> Result<u16, Box<dyn std::error::Error>> {
    let mut months: u16 = 0;

    if let Some(header_primary_text) = &parsed.header_primary_text {
        let run = header_primary_text.runs.get(1).ok_or("No second run found in header primary text")?;
        if let Some(text) = &run.text {
            months =  text.trim().to_string().parse()?;
        }
    } else if let Some(_runs) = &parsed.header_subtext.runs {
        months = 1
    }

    return Ok(months);
}

fn optional_build_message(message: &Option<Message>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(message_runs) = message {
        let message = build_message(&message_runs.runs)?;
        return Ok(Some(message));
    }

    return Ok(None);
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatMembershipItemRenderer = serde_json::from_value(value).map_err(serde_error_parse)?;
    let author_photo = parsed.author_photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;
    let tier = parse_tier(&parsed)?;
    let months = parse_months(&parsed)?;
    let message = optional_build_message(&parsed.message)?;

    let event = UniChatEvent::Sponsor {
        event_type: String::from("unichat:sponsor"),
        data: UniChatSponsorEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            author_id: parsed.author_external_channel_id.clone(),
            author_username: None,
            author_display_name: parsed.author_name.simple_text.clone(),
            author_profile_picture_url: author_photo.url.clone(),

            tier: tier,
            months: months,
            message: message
        }
    };

    return Ok(Some(event));
}
