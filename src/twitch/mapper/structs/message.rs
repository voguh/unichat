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

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes;

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
            let (emote_id, positions_raw) = raw_emote.split_once(":").ok_or("Invalid emote format")?;
            let (start, end) = positions_raw.split_once("-")
                .and_then(|(start, end)| {
                    let start = start.parse::<usize>().ok()?;
                    let end = end.parse::<usize>().ok()?;
                    return Some((start, end))
                })
                .ok_or("Invalid emote positions format")?;

            let emote_name = &message_text[start..end + 1].to_string();

            println!("Emote found: {} (ID: {})", &emote_name, &emote_id);
            let emote = UniChatEmote {
                id: emote_id.to_string(),
                emote_type: emote_name.clone(),
                tooltip: emote_name.clone(),
                url: format!("https://static-cdn.jtvnw.net/emoticons/v2/{}/default/dark/3.0", emote_id)
            };

            emotes.push(emote);
        }
    }

    return Ok(emotes);
}
