/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::LazyLock;
use std::time::Duration;

use moka::sync::Cache;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatBadge;
use crate::utils::random_color_by_seed;
use crate::youtube::mapper::structs::proxy_youtube_url;
use crate::youtube::mapper::structs::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AuthorNameWrapper {
    pub simple_text: String
}

pub type AuthorPhotoThumbnailsWrapper = ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AuthorBadgeWrapper {
    pub live_chat_author_badge_renderer: AuthorBadgeRenderer
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum AuthorBadgeRenderer {
    #[serde(rename_all = "camelCase")]
    Custom {
        tooltip: String,
        custom_thumbnail: AuthorBadgeThumbnailsWrapper
    },
    #[serde(rename_all = "camelCase")]
    Internal {
        tooltip: String,
        icon: AuthorBadgeIconWrapper
    }
}

pub type AuthorBadgeThumbnailsWrapper = ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AuthorBadgeIconWrapper {
    pub icon_type: String
}

/* <================================================================================================================> */

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BeforeContentButton {
    pub button_view_model: ButtonViewModel
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ButtonViewModel {
    pub title: String,
    pub icon_name: String
}

/* <================================================================================================================> */

static USERNAME_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^[\p{L}\p{N}_\.-]{3,30}$").unwrap());
static USERNAME_CACHE: LazyLock<Cache<String, Option<String>>> = LazyLock::new(|| Cache::builder().time_to_idle(Duration::from_secs(60 * 10)).build());

pub fn parse_author_username(name: &AuthorNameWrapper) -> Result<Option<String>, Box<dyn std::error::Error>> {
    return parse_author_username_str(name.simple_text.clone());
}

pub fn parse_author_username_str(name: String) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(cached_username) = USERNAME_CACHE.get(&name) {
        return Ok(cached_username.clone());
    }

    if name.starts_with("@") {
        let username = name.replacen("@", "", 1);

        if USERNAME_REGEX.is_match(&username) {
            USERNAME_CACHE.insert(name, Some(username.clone()));
            return Ok(Some(username));
        }
    }

    USERNAME_CACHE.insert(name, None);
    return Ok(None);
}

pub fn parse_author_name(name: &AuthorNameWrapper) -> Result<String, Box<dyn std::error::Error>> {
    return parse_author_name_str(name.simple_text.clone());
}

pub fn parse_author_name_str(name: String) -> Result<String, Box<dyn std::error::Error>> {
    let username: String;
    if name.starts_with("@") {
        username = name.replacen("@", "", 1);
    } else {
        username = name;
    }

    return Ok(username);
}

pub fn parse_author_photo(photo: &AuthorPhotoThumbnailsWrapper) -> Result<String, Box<dyn std::error::Error>> {
    let thumbnail = photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;

    return Ok(proxy_youtube_url(&thumbnail.url));
}

pub fn parse_author_color(author_name: &str) -> Result<String, Box<dyn std::error::Error>> {
    return random_color_by_seed(author_name)
}

pub fn parse_author_badges(badges: &Option<Vec<AuthorBadgeWrapper>>, before_content: &Option<Vec<BeforeContentButton>>) -> Result<Vec<UniChatBadge>, Box<dyn std::error::Error>> {
    let mut parsed_badges = Vec::new();

    if let Some(badges) = badges {
        for badge in badges {
            match &badge.live_chat_author_badge_renderer {
                AuthorBadgeRenderer::Custom { custom_thumbnail, .. } => {
                    let thumbnail = custom_thumbnail.thumbnails.last().ok_or("No thumbnails found in custom thumbnail")?;
                    parsed_badges.push(UniChatBadge {
                        code: String::from("sponsor"),
                        url: proxy_youtube_url(&thumbnail.url)
                    });
                },
                AuthorBadgeRenderer::Internal { icon, .. } => {
                    match icon.icon_type.as_str() {
                        "OWNER" => parsed_badges.push(UniChatBadge {
                            code: String::from("broadcaster"),
                            url: String::from("/assets/youtube/YouTubeBroadcaster.png")
                        }),
                        "MODERATOR" => parsed_badges.push(UniChatBadge {
                            code: String::from("moderator"),
                            url: String::from("/assets/youtube/YouTubeModerator.png")
                        }),
                        "VERIFIED" => parsed_badges.push(UniChatBadge {
                            code: String::from("verified"),
                            url: String::from("/assets/youtube/YouTubeVerified.png")
                        }),
                        // I don't know if this is correct, but on subscriptions
                        // this badge appears as `BADGE_STYLE_TYPE_VERIFIED_ARTIST`
                        // and verified as `BADGE_STYLE_TYPE_VERIFIED`, so I assume
                        // this is the correct mapping.
                        "VERIFIED_ARTIST" => parsed_badges.push(UniChatBadge {
                            code: String::from("verified-artist"),
                            url: String::from("/assets/youtube/YouTubeArtist.png")
                        }),
                        _ => {}
                    };
                }
            }
        }
    }

    if let Some(before_content_buttons) = before_content {
        for button in before_content_buttons {
            let model = button.button_view_model.clone();
            if model.icon_name == "CROWN" {
                if model.title == "#1" {
                    parsed_badges.push(UniChatBadge {
                        code: String::from("youtube-leaderboard-first"),
                        url: String::from("/assets/youtube/YouTubeLeaderboardFirst.png")
                    });
                } else if model.title == "#2" {
                    parsed_badges.push(UniChatBadge {
                        code: String::from("youtube-leaderboard-second"),
                        url: String::from("/assets/youtube/YouTubeLeaderboardSecond.png")
                    });
                } else if model.title == "#3" {
                    parsed_badges.push(UniChatBadge {
                        code: String::from("youtube-leaderboard-third"),
                        url: String::from("/assets/youtube/YouTubeLeaderboardThird.png")
                    });
                }
            }
        }
    }

    return Ok(parsed_badges);
}

fn expect_badge_type(badges: &[AuthorBadgeWrapper], badge_type: &str) -> bool {
    if badge_type == "MEMBER" {
        return badges.iter().any(|badge| matches!(
            badge.live_chat_author_badge_renderer,
            AuthorBadgeRenderer::Custom { .. }
        ));
    }

    return badges.iter().any(|badge| matches!(
        badge.live_chat_author_badge_renderer,
        AuthorBadgeRenderer::Internal { ref icon, .. } if icon.icon_type == *badge_type
    ));
}

pub fn parse_author_type(badges: &Option<Vec<AuthorBadgeWrapper>>) -> Result<UniChatAuthorType, Box<dyn std::error::Error>> {
    let mut author_type = UniChatAuthorType::Viewer;

    if let Some(badges) = badges {
        if expect_badge_type(badges, "OWNER") {
            author_type = UniChatAuthorType::Broadcaster;
        } else if expect_badge_type(badges, "MODERATOR") {
            author_type = UniChatAuthorType::Moderator;
        } else if expect_badge_type(badges, "MEMBER") {
            author_type = UniChatAuthorType::Sponsor;
        }
    }

    return Ok(author_type);
}
