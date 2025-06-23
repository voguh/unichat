use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UniChatSponsorEventPayload;
use crate::events::unichat::UNICHAT_EVENT_SPONSOR_TYPE;
use crate::utils::parse_serde_error;
use crate::youtube::mapper::structs::author::parse_author_badges;
use crate::youtube::mapper::structs::author::parse_author_color;
use crate::youtube::mapper::structs::author::parse_author_name;
use crate::youtube::mapper::structs::author::parse_author_photo;
use crate::youtube::mapper::structs::author::parse_author_type;
use crate::youtube::mapper::structs::author::AuthorBadgeWrapper;
use crate::youtube::mapper::structs::author::AuthorNameWrapper;
use crate::youtube::mapper::structs::author::AuthorPhotoThumbnailsWrapper;
use crate::youtube::mapper::structs::message::parse_message_string;
use crate::youtube::mapper::structs::message::MessageRun;
use crate::youtube::mapper::structs::message::MessageRunsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatMembershipItemRenderer {
    id: String,

    header_primary_text: Option<MessageRunsWrapper>,
    header_subtext: HeaderSubtext,
    message: Option<MessageRunsWrapper>,

    author_external_channel_id: String,
    author_name: AuthorNameWrapper,
    author_photo: AuthorPhotoThumbnailsWrapper,
    author_badges: Option<Vec<AuthorBadgeWrapper>>,

    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct HeaderSubtext {
    simple_text: Option<String>,
    runs: Option<Vec<MessageRun>>
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
        match run {
            MessageRun::Text { text } => {
                tier = text.trim().to_string();
            },
            MessageRun::Emoji { .. } => return Err("Unexpected emoji in header subtext".into())
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
        match run {
            MessageRun::Text { text } => {
                months =  text.trim().to_string().parse()?;
            },
            MessageRun::Emoji { .. } => return Err("Unexpected emoji in header subtext".into())
        }
    } else if let Some(_runs) = &parsed.header_subtext.runs {
        months = 1
    }

    return Ok(months);
}

fn optional_build_message(message: &Option<MessageRunsWrapper>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(message_runs) = message {
        let message = parse_message_string(message_runs)?;
        return Ok(Some(message));
    }

    return Ok(None);
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatMembershipItemRenderer = serde_json::from_value(value).map_err(parse_serde_error)?;
    let author_name = parse_author_name(&parsed.author_name)?;
    let author_color = parse_author_color(&author_name)?;
    let author_badges = parse_author_badges(&parsed.author_badges)?;
    let author_photo = parse_author_photo(&parsed.author_photo)?;
    let author_type = parse_author_type(&parsed.author_badges)?;
    let tier = parse_tier(&parsed)?;
    let months = parse_months(&parsed)?;
    let message = optional_build_message(&parsed.message)?;

    let event = UniChatEvent::Sponsor {
        event_type: String::from(UNICHAT_EVENT_SPONSOR_TYPE),
        data: UniChatSponsorEventPayload {
            channel_id: None,
            channel_name: None,
            platform: UniChatPlatform::YouTube,

            author_id: parsed.author_external_channel_id,
            author_username: None,
            author_display_name: author_name,
            author_display_color: author_color,
            author_badges: author_badges,
            author_profile_picture_url: author_photo,
            author_type: author_type,

            tier: tier,
            months: months,
            message_text: message
        }
    };

    return Ok(Some(event));
}
