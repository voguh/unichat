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

fn get_emoji_type(emoji: &MessageRunEmoji) -> String {
    if let Some(search_terms) = &emoji.search_terms {
        search_terms.first().unwrap().clone()
    } else {
        emoji.emoji_id.clone()
    }
}

fn build_message(runs: &Vec<MessageRun>) -> String {
    let mut str_message = Vec::new();

    for run in runs {
        if let Some(text) = &run.text {
            str_message.push(text.clone());
        } else if let Some(emoji) = &run.emoji {
            str_message.push(get_emoji_type(emoji))
        }
    }

    str_message.join(" ")
}

fn build_emotes(runs: &Vec<MessageRun>) -> Vec<UniChatEmote> {
    let mut emotes = Vec::new();

    for run in runs {
        if let Some(emoji) = &run.emoji {
            emotes.push(UniChatEmote {
                emote_type: get_emoji_type(emoji),
                tooltip: get_emoji_type(emoji),
                url: emoji.image.thumbnails.last().unwrap().url.clone()
            });
        }
    }

    emotes
}


fn get_badge_icon_type(badge: &LiveChatAuthorBadgeRenderer) -> String {
    let renderer = &badge.live_chat_author_badge_renderer;
    if let Some(icon) = &renderer.icon {
        icon.icon_type.clone()
    } else if badge.live_chat_author_badge_renderer.custom_thumbnail.is_some() {
        String::from("CUSTOM")
    } else {
        String::from("")
    }
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

    String::from(author_color)
}

fn build_author_badges(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> Vec<UniChatBadge> {
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
                pbadges.push(UniChatBadge {
                    badge_type: String::from("sponsor"),
                    tooltip: String::from("Sponsor"),
                    url: custom_thumbnail.thumbnails.last().unwrap().url.clone()
                })
            }
        }
    }


    pbadges
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

    String::from(author_type)
}

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, serde_json::Error> {
    let item = value.get("item").unwrap();

    if let Some(value) = item.get("liveChatMembershipItemRenderer") {
        live_chat_membership_item_renderer::parse(value.clone())
    } else if let Some(value) = item.get("liveChatPaidMessageRenderer") {
        live_chat_paid_message_renderer::parse(value.clone())
    } else if let Some(value) = item.get("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer") {
        live_chat_sponsorships_gift_purchase_announcement_renderer::parse(value.clone())
    } else if let Some(value) = item.get("liveChatTextMessageRenderer") {
        live_chat_text_message_renderer::parse(value.clone())
    } else {
        Ok(None)
    }
}
