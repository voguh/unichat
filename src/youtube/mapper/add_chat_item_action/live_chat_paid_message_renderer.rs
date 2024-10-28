use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatDonateEventPayload, UniChatEmote, UniChatEvent};
use crate::youtube::mapper::{AuthorName, ThumbnailsWrapper};

use super::{build_author_badges, build_emotes, build_message, get_author_color, get_author_type, LiveChatAuthorBadgeRenderer, Message};

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

fn parse_purchase_amount(purchase_amount_text: &PurchaseAmountText) -> (String, f32) {
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

    (currency, raw_value.parse().unwrap_or(0.0))
}

fn build_option_message(message: &Option<Message>) -> String {
    if let Some(message) = message {
        build_message(&message.runs)
    } else {
        String::from("")
    }
}

fn build_option_emotes(message: &Option<Message>) -> Vec<UniChatEmote> {
    if let Some(message) = message {
        build_emotes(&message.runs)
    } else {
        Vec::new()
    }
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    match serde_json::from_value::<LiveChatPaidMessageRenderer>(value) {
        Ok(parsed) => {
            let (purchase_currency, purchase_value) = parse_purchase_amount(&parsed.purchase_amount_text);

            Ok(Some(UniChatEvent::Donate {
                event_type: String::from("unichat:donate"),
                detail: UniChatDonateEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    author_id: parsed.author_external_channel_id,
                    author_username: None,
                    author_display_name: parsed.author_name.simple_text,
                    author_display_color: get_author_color(&parsed.author_badges),
                    author_badges: build_author_badges(&parsed.author_badges),
                    author_profile_picture_url: parsed.author_photo.thumbnails.last().unwrap().url.clone(),
                    author_type: get_author_type(&parsed.author_badges),

                    value: purchase_value,
                    currency: purchase_currency,

                    message_id: parsed.id,
                    message: build_option_message(&parsed.message),
                    emotes: build_option_emotes(&parsed.message)
                }
            }))
        }

        Err(err) => {
            Err(err)
        }
    }
}
