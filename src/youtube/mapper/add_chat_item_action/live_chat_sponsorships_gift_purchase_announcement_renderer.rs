use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatSponsorGiftEventPayload;
use crate::youtube::mapper::add_chat_item_action::LiveChatAuthorBadgeRenderer;
use crate::youtube::mapper::serde_error_parse;
use crate::youtube::mapper::AuthorName;
use crate::youtube::mapper::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
    pub id: String,

    pub author_external_channel_id: String,

    pub header: Header,

    pub timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Header {
    live_chat_sponsorships_header_renderer: LiveChatSponsorshipsHeaderRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatSponsorshipsHeaderRenderer {
    pub primary_text: RunsWrapper,

    pub image: ThumbnailsWrapper,

    pub author_name: AuthorName,
    pub author_photo: ThumbnailsWrapper,
    pub author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct RunsWrapper {
    pub runs: Vec<Run>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Run {
    pub text: String
}

fn parse_tier(render: &LiveChatSponsorshipsHeaderRenderer) -> Result<String, Box<dyn std::error::Error>> {
    let run = render.primary_text.runs.get(3).ok_or("No tier run found")?;

    return Ok(run.text.trim().to_string())
}

fn parse_count(render: &LiveChatSponsorshipsHeaderRenderer) -> Result<u16, Box<dyn std::error::Error>> {
    let run = render.primary_text.runs.get(1).ok_or("No count run found")?;
    let raw_count = run.text.trim();
    let count: u16 = raw_count.parse()?;

    return Ok(count);
}

/* <============================================================================================> */

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatSponsorshipsGiftPurchaseAnnouncementRenderer = serde_json::from_value(value).map_err(serde_error_parse)?;
    let render = parsed.header.live_chat_sponsorships_header_renderer;
    let author_photo  = render.author_photo.thumbnails.last().ok_or("No author photo found")?;
    let tier = parse_tier(&render)?;
    let count = parse_count(&render)?;

    let event = UniChatEvent::SponsorGift {
        event_type: String::from("unichat:sponsor_gift"),
        data: UniChatSponsorGiftEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            author_id: parsed.author_external_channel_id.clone(),
            author_username: None,
            author_display_name: render.author_name.simple_text.clone(),
            author_profile_picture_url: author_photo.url.clone(),

            tier: tier,
            count: count,
        }
    };

    return Ok(Some(event));
}
