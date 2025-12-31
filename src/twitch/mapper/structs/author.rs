/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;

use anyhow::anyhow;
use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatBadge;
use crate::irc::IRCPrefix;
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

pub fn parse_author_username(prefix: &Option<IRCPrefix>) -> Result<Option<String>, Error> {
    if let Some(prefix) = prefix {
        if let IRCPrefix::Nick(_nickname, username, _hostname) = prefix.to_owned() {
            return Ok(Some(username));
        }
    }

    return Ok(None);
}

pub fn parse_author_username_str(login: Option<&Option<String>>) -> Result<Option<String>, Error> {
    let login = login.and_then(|v| v.as_ref());

    let login = login.ok_or(anyhow!("Missing login tag"))?;
    return Ok(Some(login.to_owned()));
}

pub fn parse_author_name(display_name: Option<&Option<String>>) -> Result<String, Error> {
    let display_name = display_name.and_then(|v| v.as_ref());

    let author_name = display_name.ok_or(anyhow!("Missing display-name tag"))?;
    return Ok(author_name.to_owned());
}

// pub fn parse_author_photo(photo: &AuthorPhotoThumbnailsWrapper) -> Result<String, Error> {
//     let thumbnail = photo.thumbnails.last().ok_or("No thumbnails found in author photo")?;

//     return Ok(thumbnail.url.clone());
// }

pub fn parse_author_color(color: Option<&Option<String>>, author_name: &Option<String>) -> Result<String, Error> {
    let color = color.and_then(|v| v.as_ref());

    if let Some(color) = color {
        return Ok(color.to_owned());
    } else {
        let username = author_name.as_ref().ok_or(anyhow!("Missing author name"))?;
        return random_color_by_seed(&username);
    }
}


pub fn parse_author_badges(badges: Option<&Option<String>>) -> Result<Vec<UniChatBadge>, Error> {
    let badges = badges.and_then(|v| v.as_ref());

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

pub fn parse_author_type(tags: &HashMap<String, Option<String>>) -> Result<UniChatAuthorType, Error> {
    let mut author_type = UniChatAuthorType::Viewer;

    if let Some(value) = tags.get("badges").and_then(|v| v.as_ref()) {
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
