/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes;
use crate::twitch::TWITCH_CHEERMOTES;

fn normalize_message_text(message_raw: &str) -> String {
    let mut message_raw = message_raw.trim().to_string();
    if message_raw.starts_with("\u{1}ACTION ") && message_raw.ends_with("\u{1}") {
        message_raw = message_raw.replace("\u{1}ACTION ", "").replace("\u{1}", "");
    }

    return message_raw;
}

fn parse_delimiter(start: &str, end: &str) -> Result<(usize, usize), Box<dyn std::error::Error>> {
    let start = start.parse::<usize>()?;
    let end = end.parse::<usize>()?;
    return Ok((start, end));
}

pub fn parse_message_emotes(raw_emotes: Option<&String>, message_text: &str) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    let message_text = normalize_message_text(message_text);
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

pub fn parse_message_string(message_raw: &String) -> Result<String, Box<dyn std::error::Error>> {
    let message_raw = normalize_message_text(message_raw);
    let mut str_message = Vec::new();

    if let Ok(cheermotes) = TWITCH_CHEERMOTES.read() {
        for word in message_raw.split_whitespace() {
            let prefix_end = word.find(|c: char| c.is_digit(10)).unwrap_or(word.len());
            let prefix = &word[..prefix_end];
            let suffix = &word[prefix_end..];
            let amount: u32 = suffix.parse().unwrap_or(0);

            if !cheermotes.contains(prefix) || (amount < 1 || amount > 100000) {
                str_message.push(word);
            }
        }
    }

    return Ok(str_message.join(" "));
}
