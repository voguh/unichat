use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatDonateEventPayload;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::youtube::mapper::add_chat_item_action::build_author_badges;
use crate::youtube::mapper::add_chat_item_action::build_emotes;
use crate::youtube::mapper::add_chat_item_action::build_message;
use crate::youtube::mapper::add_chat_item_action::get_author_color;
use crate::youtube::mapper::add_chat_item_action::get_author_type;
use crate::youtube::mapper::add_chat_item_action::LiveChatAuthorBadgeRenderer;
use crate::youtube::mapper::add_chat_item_action::Message;
use crate::youtube::mapper::serde_error_parse;
use crate::youtube::mapper::AuthorName;
use crate::youtube::mapper::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatPaidMessageRenderer {
    id: String,

    purchase_amount_text: PurchaseAmountText,
    message: Option<Message>,

    author_external_channel_id: String,
    author_name: AuthorName,
    author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>,
    author_photo: ThumbnailsWrapper,
    timestamp_usec: String
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PurchaseAmountText {
    simple_text: String
}

/* <============================================================================================> */

fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> Result<(String, f32), Box<dyn std::error::Error>> {
    let mut raw_value = String::from("");
    let mut currency = String::from("");

    for ch in purchase_amount_text.simple_text.chars().rev() {
        if ch.is_numeric() || ch == '.' || ch == ',' {
            if ch.is_numeric() || ch == '.' {
                raw_value.insert(0, ch);
            }
        } else {
            currency.insert(0, ch);
        }
    }

    let value: f32 = raw_value.parse()?;

    return Ok((currency, value));
}

fn build_option_message(message: &Option<Message>) -> Result<String, Box<dyn std::error::Error>> {
    if let Some(message) = message {
        return build_message(&message.runs);
    }

    return Ok(String::from(""));
}

fn build_option_emotes(message: &Option<Message>) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    if let Some(message) = message {
        return build_emotes(&message.runs);
    }

    return Ok(Vec::new());
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let parsed: LiveChatPaidMessageRenderer = serde_json::from_value(value).map_err(serde_error_parse)?;
    let badges = build_author_badges(&parsed.author_badges)?;
    let author_photo = parsed.author_photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;
    let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text)?;
    let message = build_option_message(&parsed.message)?;
    let emotes = build_option_emotes(&parsed.message)?;

    let event = UniChatEvent::Donate {
        event_type: String::from("unichat:donate"),
        data: UniChatDonateEventPayload {
            channel_id: None,
            channel_name: None,
            platform: String::from("youtube"),

            author_id: parsed.author_external_channel_id,
            author_username: None,
            author_display_name: parsed.author_name.simple_text,
            author_display_color: get_author_color(&parsed.author_badges),
            author_badges: badges,
            author_profile_picture_url: author_photo.url.clone(),
            author_type: get_author_type(&parsed.author_badges),

            value: purchase_value,
            currency: purchase_currency,

            message_id: parsed.id,
            message: message,
            emotes: emotes
        }
    };

    return Ok(Some(event));
}
