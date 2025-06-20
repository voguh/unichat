use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatBadge;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::youtube::mapper::AuthorBadge;
use crate::youtube::mapper::ThumbnailsWrapper;

mod live_chat_membership_item_renderer;
mod live_chat_paid_message_renderer;
mod live_chat_sponsorships_gift_purchase_announcement_renderer;
mod live_chat_text_message_renderer;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LiveChatAuthorBadgeRenderer {
    live_chat_author_badge_renderer: AuthorBadge
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Message {
    runs: Vec<MessageRun>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MessageRun {
    text: Option<String>,
    emoji: Option<MessageRunEmoji>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MessageRunEmoji {
    emoji_id: String,
    is_custom_emoji: Option<bool>,
    search_terms: Option<Vec<String>>,
    shortcuts: Option<Vec<String>>,
    image: ThumbnailsWrapper
}

/* <============================================================================================> */

fn get_emoji_type(emoji: &MessageRunEmoji) -> Result<String, Box<dyn std::error::Error>> {
    if let Some(search_terms) = &emoji.search_terms {
        let search_term = search_terms.first().ok_or("No search terms found")?;
        return Ok(search_term.clone());
    }

    return Ok(emoji.emoji_id.clone());
}

fn build_message(runs: &Vec<MessageRun>) -> Result<String, Box<dyn std::error::Error>> {
    let mut str_message = Vec::new();

    for run in runs {
        if let Some(text) = &run.text {
            str_message.push(text.clone());
        } else if let Some(emoji) = &run.emoji {
            let emoji_type = get_emoji_type(emoji)?;
            str_message.push(emoji_type);
        }
    }

    return Ok(str_message.join(" "));
}

fn build_emotes(runs: &Vec<MessageRun>) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    let mut emotes = Vec::new();

    for run in runs {
        if let Some(emoji) = &run.emoji {
            let emoji_type = get_emoji_type(emoji)?;
            let thumbnail = emoji.image.thumbnails.last().ok_or("No thumbnails found for emoji")?;
            emotes.push(UniChatEmote {
                emote_type: emoji_type.clone(),
                tooltip: emoji_type.clone(),
                url: thumbnail.url.clone()
            });
        }
    }

    return Ok(emotes);
}


fn get_badge_icon_type(badge: &LiveChatAuthorBadgeRenderer) -> String {
    let renderer = &badge.live_chat_author_badge_renderer;

    if let Some(icon) = &renderer.icon {
        return icon.icon_type.clone();
    } else if badge.live_chat_author_badge_renderer.custom_thumbnail.is_some() {
        return String::from("CUSTOM");
    }

    return String::from("");
}

fn get_author_color(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> String {
    let mut author_color = "#ffffffb2";

    if let Some(badges) = badges {
        if badges.iter().any(|badge| get_badge_icon_type(badge) == "OWNER") {
            author_color = "#ffd600"
        } else if badges.iter().any(|badge| get_badge_icon_type(badge) == "MODERATOR") {
            author_color = "#5e84f1"
        } else if badges.iter().any(|badge| get_badge_icon_type(badge) == "CUSTOM") {
            author_color = "#2ba640"
        }
    }

    return String::from(author_color);
}

fn build_author_badges(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> Result<Vec<UniChatBadge>, Box<dyn std::error::Error>> {
    let mut pbadges = Vec::new();

    if let Some(badges) = badges {
        for badge in badges {
            let renderer = &badge.live_chat_author_badge_renderer;
            if let Some(icon) = &renderer.icon {
                match icon.icon_type.as_str() {
                    "OWNER" => pbadges.push(UniChatBadge {
                        badge_type: String::from("broadcaster"),
                        tooltip: String::from("Broadcaster"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1")
                    }),
                    "MODERATOR" => pbadges.push(UniChatBadge {
                        badge_type: String::from("moderator"),
                        tooltip: String::from("Moderator"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1")
                    }),
                    "VERIFIED" => pbadges.push(UniChatBadge {
                        badge_type: String::from("verified"),
                        tooltip: String::from("Verified"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1")
                    }),
                    _ => {}
                };
            } else if let Some(custom_thumbnail) = &renderer.custom_thumbnail {
                let thumbnail = custom_thumbnail.thumbnails.last().ok_or("No thumbnails found in custom thumbnail")?;
                pbadges.push(UniChatBadge {
                    badge_type: String::from("sponsor"),
                    tooltip: String::from("Sponsor"),
                    url: thumbnail.url.clone()
                })
            }
        }
    }

    return Ok(pbadges);
}

fn get_author_type(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> String {
    let mut author_type = "VIEWER";

    if let Some(badges) = badges {
        if badges.iter().any(|badge| get_badge_icon_type(badge) == "OWNER") {
            author_type = "BROADCASTER"
        } else if badges.iter().any(|badge| get_badge_icon_type(badge) == "MODERATOR") {
            author_type = "MODERATOR"
        } else if badges.iter().any(|badge| get_badge_icon_type(badge) == "CUSTOM") {
            author_type = "SPONSOR"
        }
    }

    return String::from(author_type);
}

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let item = value.get("item").ok_or("No item found in value")?;

    if let Some(value) = item.get("liveChatMembershipItemRenderer") {
        return live_chat_membership_item_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatPaidMessageRenderer") {
        return live_chat_paid_message_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer") {
        return live_chat_sponsorships_gift_purchase_announcement_renderer::parse(value.clone());
    } else if let Some(value) = item.get("liveChatTextMessageRenderer") {
        return live_chat_text_message_renderer::parse(value.clone());
    }

    return Ok(None);
}
