/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatBadge;
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

pub fn parse_author_name(name: &AuthorNameWrapper) -> Result<String, Box<dyn std::error::Error>> {
    return Ok(name.simple_text.clone());
}

pub fn parse_author_photo(photo: &AuthorPhotoThumbnailsWrapper) -> Result<String, Box<dyn std::error::Error>> {
    let thumbnail = photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;

    return Ok(thumbnail.url.clone());
}

pub fn parse_author_color(author_name: &str) -> Result<String, Box<dyn std::error::Error>> {
    let mut hash: u32 = 2166136261;
    for byte in author_name.as_bytes() {
        hash ^= *byte as u32;
        hash = hash.wrapping_mul(16777619);
    }

    let r = ((hash >> 16) & 0xFF) as u8;
    let g = ((hash >> 8) & 0xFF) as u8;
    let b = (hash & 0xFF) as u8;

    return Ok(format!("#{:02X}{:02X}{:02X}", r, g, b));
}

pub fn parse_author_badges(badges: &Option<Vec<AuthorBadgeWrapper>>) -> Result<Vec<UniChatBadge>, Box<dyn std::error::Error>> {
    let mut parsed_badges = Vec::new();

    if let Some(badges) = badges {
        for badge in badges {
            match &badge.live_chat_author_badge_renderer {
                AuthorBadgeRenderer::Custom { custom_thumbnail, .. } => {
                    let thumbnail = custom_thumbnail.thumbnails.last().ok_or("No thumbnails found in custom thumbnail")?;
                    parsed_badges.push(UniChatBadge {
                        badge_type: String::from("sponsor"),
                        tooltip: String::from("Sponsor"),
                        url: thumbnail.url.clone()
                    });
                },
                AuthorBadgeRenderer::Internal { icon, .. } => {
                    match icon.icon_type.as_str() {
                        "OWNER" => parsed_badges.push(UniChatBadge {
                            badge_type: String::from("broadcaster"),
                            tooltip: String::from("Broadcaster"),
                            url: String::from("https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1")
                        }),
                        "MODERATOR" => parsed_badges.push(UniChatBadge {
                            badge_type: String::from("moderator"),
                            tooltip: String::from("Moderator"),
                            url: String::from("https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1")
                        }),
                        "VERIFIED" => parsed_badges.push(UniChatBadge {
                            badge_type: String::from("verified"),
                            tooltip: String::from("Verified"),
                            url: String::from("https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1")
                        }),
                        _ => {}
                    };
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
