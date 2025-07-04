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

use std::collections::HashSet;
use std::sync::LazyLock;

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes;

fn parse_delimiter(start: &str, end: &str) -> Result<(usize, usize), Box<dyn std::error::Error>> {
    let start = start.parse::<usize>()?;
    let end = end.parse::<usize>()?;
    return Ok((start, end));
}

pub fn parse_message_emotes(raw_emotes: Option<&String>, message_text: &str) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    let mut emotes = Vec::new();

    if let Ok(custom_emotes) = shared_emotes::EMOTES_HASHSET.read() {
        for word in message_text.split_whitespace() {
            if let Some(emote) = custom_emotes.get(word) {
                emotes.push(emote.clone());
            }
        }
    }

    if let Some(raw_emotes) = raw_emotes {
        for raw_emote in raw_emotes.split("/") {
            if raw_emote.trim().is_empty() {
                continue;
            }

            let (emote_id, positions_raw) = raw_emote.split_once(":").ok_or("Invalid emote format")?;

            // Get first delimiter to retrieve emote code
            let positions_raw = positions_raw.split(",").next().ok_or("Invalid emote positions format")?;
            let (start, end) = positions_raw.split_once("-")
                .and_then(|(start, end)| parse_delimiter(start, end).ok())
                .ok_or("Invalid emote positions format")?;

            let emote_code = &message_text[start..end + 1].to_string();

            let emote = UniChatEmote {
                id: emote_id.to_string(),
                code: emote_code.clone(),
                url: format!("https://static-cdn.jtvnw.net/emoticons/v2/{}/default/dark/3.0", emote_id)
            };

            emotes.push(emote);
        }
    }

    return Ok(emotes);
}

static CHEER_VARIANTS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| HashSet::from([
    "cheer", "cheerwhal", "Corgo", "uni", "ShowLove", "Party", "SeemsGood", "Pride", "Kappa", "FrankerZ", "HeyGuys",
    "DansGame", "TriHard", "Kreygasm", "4Head", "SwiftRage", "NotLikeThis", "FailFish", "VoHiYo", "PJSalt",
    "MrDestructoid", "bday", "RIPCheer", "Shamrock"
]));

pub fn parse_message_string(message_raw: &String) -> Result<String, Box<dyn std::error::Error>> {
    let mut str_message = Vec::new();

    for word in message_raw.split_whitespace() {
        let prefix_end = word.find(|c: char| c.is_digit(10)).unwrap_or(word.len());
        let prefix = &word[..prefix_end];
        let suffix = &word[prefix_end..];

        if !CHEER_VARIANTS.contains(prefix) || suffix.parse::<u32>().is_ok() {
            str_message.push(word);
        }
    }

    return Ok(str_message.join(" "));
}
