/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use anyhow::anyhow;

use crate::events::UniChatEmote;
use crate::shared_emotes;
use crate::twitch::read_cheermotes;

/* ========================================================================== */

fn normalize_message_text(message_raw: &str) -> String {
    let mut message_raw = message_raw.trim().to_string();
    if message_raw.starts_with("\u{1}ACTION") && message_raw.ends_with("\u{1}") {
        message_raw = message_raw.replace("\u{1}ACTION", "").replace("\u{1}", "").trim().to_string();
    }

    return message_raw;
}

fn parse_delimiter(start: &str, end: &str) -> Result<(usize, usize), Error> {
    let start: usize = start.parse()?;
    let end: usize = end.parse()?;
    return Ok((start, end));
}

fn parse_raw_emote(raw_emote: &str, message_text: &str) -> Result<UniChatEmote, Error> {
    if let Some((emote_id, positions)) = raw_emote.split_once(':') {
        let first_range = positions.split_once(',').map_or(positions, |(first_range, _)| first_range);
        if let Some((start, end)) = first_range.split_once('-') {
            let (start, end) = parse_delimiter(start, end)?;
            let code: String = message_text.chars().skip(start).take((end - start) + 1).collect();
            let url = format!("https://static-cdn.jtvnw.net/emoticons/v2/{}/default/dark/3.0", emote_id);

            return Ok(UniChatEmote { id: emote_id.to_string(), code: code, url: url });
        }
    }

    return Err(anyhow!("Invalid emote '{}'", raw_emote));
}

pub fn parse_message_emotes(raw_emotes: Option<String>, message_text: &str) -> Result<Vec<UniChatEmote>, Error> {
    let message_text = normalize_message_text(message_text);
    let mut emotes = Vec::new();

    let custom_emotes = shared_emotes::read();
    for word in message_text.split_whitespace() {
        if let Some(emote) = custom_emotes.get(word) {
            emotes.push(emote.clone());
        }
    }

    if let Some(raw_emotes) = raw_emotes {
        for raw_emote in raw_emotes.split("/") {
            if raw_emote.trim().is_empty() {
                continue;
            }

            let emote = parse_raw_emote(raw_emote, &message_text)?;
            emotes.push(emote);
        }
    }

    return Ok(emotes);
}

pub fn parse_message_string(message_raw: &str) -> String {
    let message_raw = normalize_message_text(message_raw);
    let mut str_message = Vec::new();

    let cheermotes = read_cheermotes();
    for word in message_raw.split_whitespace() {
        let prefix_end = word.find(|c: char| c.is_ascii_digit()).unwrap_or(word.len());
        let prefix = &word[..prefix_end];
        let suffix = &word[prefix_end..];
        let amount: u32 = suffix.parse().unwrap_or(0);

        if !cheermotes.contains(prefix) || !(1..=100000).contains(&amount) {
            str_message.push(word);
        }
    }

    return str_message.join(" ");
}
