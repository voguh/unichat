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

use std::collections::HashMap;

use irc::client::prelude::Prefix;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatBadge;
use crate::twitch::TWITCH_BADGES;
use crate::utils::random_color_by_seed;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TwitchRawBadge {
    pub id: String,
    #[serde(rename = "setID")]
    pub set_id: String,
    pub version: String,
    pub title: String,
    pub image_1x: String,
    pub image_2x: String,
    pub image_4x: String,
    pub click_action: Option<String>,
    #[serde(rename = "clickURL")]
    pub click_url: Option<String>,
    #[serde(rename = "__typename")]
    pub typename: String
}

/* <================================================================================================================> */

pub fn parse_author_username(prefix: &Option<Prefix>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(prefix) = prefix {
        if let Prefix::Nickname(_nickname, username, _hostname) = prefix.to_owned() {
            return Ok(Some(username));
        }
    }

    return Ok(None);
}

// Just a wrapper function to handle Option<&String> to Option<String>
pub fn parse_author_username_str(login: Option<&String>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    return Ok(login.cloned());
}

pub fn parse_author_name(display_name: Option<&String>) -> Result<String, Box<dyn std::error::Error>> {
    let author_name = display_name.ok_or("Missing display-name tag")?;
    return Ok(author_name.to_owned());
}

// pub fn parse_author_photo(photo: &AuthorPhotoThumbnailsWrapper) -> Result<String, Box<dyn std::error::Error>> {
//     let thumbnail = photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;

//     return Ok(thumbnail.url.clone());
// }

pub fn parse_author_color(color: Option<&String>, author_name: &Option<String>) -> Result<String, Box<dyn std::error::Error>> {
    if let Some(color) = color {
        return Ok(color.to_owned());
    } else {
        let username = author_name.as_ref().ok_or("Missing author name")?;
        return random_color_by_seed(&username);
    }
}


pub fn parse_author_badges(badges: Option<&String>) -> Result<Vec<UniChatBadge>, Box<dyn std::error::Error>> {
    let mut parsed_badges = Vec::new();

    if let Some(badge_str) = badges {
        if let Ok(twitch_badges) = TWITCH_BADGES.read() {
            for badge in badge_str.split(',') {
                if let Some(twitch_badge) = twitch_badges.get(badge).or_else(|| twitch_badges.get(&format!("global/{}", badge))) {
                    parsed_badges.push(twitch_badge.to_owned());
                }
            }
        }
    }

    return Ok(parsed_badges);
}

pub fn parse_author_type(tags: &HashMap<String, String>) -> Result<UniChatAuthorType, Box<dyn std::error::Error>> {
    let mut author_type = UniChatAuthorType::Viewer;

    if let Some(value) = tags.get("badges") {
        if value.contains("broadcaster") {
            author_type = UniChatAuthorType::Broadcaster;
        } else if value.contains("moderator") {
            author_type = UniChatAuthorType::Moderator;
        } else if value.contains("vip") {
            author_type = UniChatAuthorType::Vip;
        } else if value.contains("subscriber") {
            author_type = UniChatAuthorType::Sponsor;
        }
    }

    return Ok(author_type);
}
