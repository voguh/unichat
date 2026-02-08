/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes;
use crate::twitch::TWITCH_CHEERMOTES;

fn normalize_message_text(message_raw: &str) -> String {
    let mut message_raw = message_raw.trim().to_string();
    if message_raw.starts_with("\u{1}ACTION") && message_raw.ends_with("\u{1}") {
        message_raw = message_raw.replace("\u{1}ACTION", "").replace("\u{1}", "").trim().to_string();
    }

    return message_raw;
}

fn parse_delimiter(start: &str, end: &str) -> Result<(usize, usize), Error> {
    let start = start.parse::<usize>()?;
    let end = end.parse::<usize>()?;
    return Ok((start, end));
}

pub fn parse_message_emotes(raw_emotes: Option<&Option<String>>, message_text: &str) -> Result<Vec<UniChatEmote>, Error> {
    let raw_emotes = raw_emotes.and_then(|v| v.as_ref());

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

            let (emote_id, positions_raw) = raw_emote.split_once(":").ok_or(anyhow!("Invalid emote format"))?;
            let first_range = positions_raw.split(",").next().ok_or(anyhow!("Invalid emote positions format"))?;
            let (start_str, end_str) = first_range.split_once("-").ok_or(anyhow!("Invalid emote positions format"))?;
            let (start, end) = parse_delimiter(start_str, end_str)?;

            let emote_code: String = message_text.chars().skip(start).take((end - start) + 1).collect();
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

pub fn parse_message_string(message_raw: &String) -> Result<String, Error> {
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
