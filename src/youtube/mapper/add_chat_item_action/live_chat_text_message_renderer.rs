use serde::{Deserialize, Serialize};

use crate::events::unichat::{UniChatBadge, UniChatEmote, UniChatEvent, UniChatMessageEventPayload};
use crate::youtube::mapper::{AuthorBadges, AuthorName, ThumbnailsWrapper};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatTextMessageRenderer {
    id: String,
    message: Message,
    author_external_channel_id: String,
    author_name: AuthorName,
    author_badges: Option<Vec<LiveChatAuthorBadgeRenderer>>,
    author_photo: ThumbnailsWrapper,
    timestamp_usec: String
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
    is_custom_emoji: bool,
    search_terms: Vec<String>,
    shortcuts: Vec<String>,
    image: ThumbnailsWrapper
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveChatAuthorBadgeRenderer {
    #[serde(rename = "liveChatAuthorBadgeRenderer")]
    renderer: AuthorBadges
}

/* <============================================================================================> */

fn build_message(runs: &Vec<MessageRun>) -> String {
    let mut str_message = Vec::new();

    for run in runs {
        if let Some(text) = &run.text {
            str_message.push(text.clone());
        } else if let Some(emoji) = &run.emoji {
            str_message.push(emoji.search_terms.first().unwrap().clone())
        }
    }

    str_message.join(" ")
}

fn build_emotes(runs: &Vec<MessageRun>) -> Vec<UniChatEmote> {
    let mut emotes = Vec::new();

    for run in runs {
        if let Some(emoji) = &run.emoji {
            emotes.push(UniChatEmote {
                emote_type: emoji.search_terms.first().unwrap().clone(),
                tooltip: emoji.search_terms.first().unwrap().clone(),
                url: emoji.image.thumbnails.last().unwrap().url.clone()
            });
        }
    }

    emotes
}

fn get_author_color(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> String {
    let mut author_color = "#ffffffb2";

    if let Some(badges) = badges {
        if badges.iter().any(|badge| badge.renderer.tooltip == "Owner") {
            author_color = "#ffd600"
        } else if badges.iter().any(|badge| badge.renderer.tooltip == "Moderator") {
            author_color = "#5e84f1"
        } else if badges.iter().any(|badge| badge.renderer.custom_thumbnail.is_some()) {
            author_color = "#2ba640"
        }
    }

    String::from(author_color)
}

fn build_author_badges(badges: &Option<Vec<LiveChatAuthorBadgeRenderer>>) -> Vec<UniChatBadge> {
    let mut pbadges = Vec::new();

    if let Some(badges) = badges {
        for badge in badges {
            let renderer = &badge.renderer;
            if let Some(icon) = &renderer.icon {
                match icon.icon_type.to_lowercase().as_str() {
                    "owner" => pbadges.push(UniChatBadge {
                        badge_type: String::from("broadcaster"),
                        tooltip: String::from("Broadcaster"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1")
                    }),
                    "moderator" => pbadges.push(UniChatBadge {
                        badge_type: String::from("moderator"),
                        tooltip: String::from("Moderator"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1")
                    }),
                    "verified" => pbadges.push(UniChatBadge {
                        badge_type: String::from("verified"),
                        tooltip: String::from("Verified"),
                        url: String::from("https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1")
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
        if badges.iter().any(|badge| badge.renderer.tooltip == "Owner") {
            author_type = "BROADCASTER"
        } else if badges.iter().any(|badge| badge.renderer.tooltip == "Moderator") {
            author_type = "MODERATOR"
        } else if badges.iter().any(|badge| badge.renderer.custom_thumbnail.is_some()) {
            author_type = "SPONSOR"
        }
    }

    String::from(author_type)
}

pub fn parse(value: serde_json::Value) -> Option<UniChatEvent> {
    let mut event: Option<UniChatEvent> = None;

    match serde_json::from_value::<LiveChatTextMessageRenderer>(value) {
        Ok(parsed) => {
            event = Some(UniChatEvent::Message {
                event_type: String::from("unichat:message"),
                detail: UniChatMessageEventPayload {
                    channel_id: None,
                    channel_name: None,
                    platform: String::from("youtube"),

                    message_id: parsed.id,
                    message_text: build_message(&parsed.message.runs),
                    emotes: build_emotes(&parsed.message.runs),

                    author_id: parsed.author_external_channel_id,
                    author_username: None,
                    author_display_name: parsed.author_name.simple_text,
                    author_display_color: get_author_color(&parsed.author_badges),
                    author_badges: build_author_badges(&parsed.author_badges),
                    author_profile_picture_url: parsed.author_photo.thumbnails.last().unwrap().url.clone(),
                    author_type: get_author_type(&parsed.author_badges),

                    timestamp: parsed.timestamp_usec.parse::<u64>().unwrap()
                }
            })
        }

        Err(err) => {
            eprintln!("live_chat_text_message_renderer error: {:?}", err)
        }
    }

    event
}
