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

use crate::events::unichat::UniChatAuthorType;
use crate::events::unichat::UniChatBadge;
use crate::utils::random_color_by_seed;

pub fn parse_author_username(prefix: &Option<Prefix>) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if let Some(prefix) = prefix {
        if let Prefix::Nickname(_nickname, username, _hostname) = prefix.to_owned() {
            return Ok(Some(username));
        }
    }

    return Ok(None);
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
        for badge in badge_str.split(',') {

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
