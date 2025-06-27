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

use crate::bttv::BTTV_EMOTES_HASHSET;
use crate::events::unichat::UniChatEmote;
use crate::youtube::mapper::structs::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MessageRunsWrapper {
    pub runs: Vec<MessageRun>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum MessageRun {
    #[serde(rename_all = "camelCase")]
    Text {
        text: String
    },
    #[serde(rename_all = "camelCase")]
    Emoji {
        emoji: Emoji
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Emoji {
    #[serde(rename_all = "camelCase")]
    Custom {
        emoji_id: String,
        is_custom_emoji: bool, // Always true for custom emojis
        search_terms: Vec<String>,
        shortcuts: Vec<String>,
        image: CustomEmojiThumbnailsWrapper
    },
    #[serde(rename_all = "camelCase")]
    FontBased {
        emoji_id: String,
        image: FontBaseEmojiThumbnailsWrapper
    },

}

pub type CustomEmojiThumbnailsWrapper = ThumbnailsWrapper;

pub type FontBaseEmojiThumbnailsWrapper = ThumbnailsWrapper;

/* <================================================================================================================> */

pub fn parse_message_emojis(message_runs: &MessageRunsWrapper) -> Result<Vec<UniChatEmote>, Box<dyn std::error::Error>> {
    let mut emotes = Vec::new();

    for run in &message_runs.runs {
        match run {
            MessageRun::Text { .. } => {},
            MessageRun::Emoji { emoji } => {
                match emoji {
                    Emoji::Custom { emoji_id, image, shortcuts, .. } => {
                        let shortcut = shortcuts.first().ok_or("No shortcuts found for custom emoji")?;
                        let last_image = image.thumbnails.last().ok_or("No thumbnails found for font-based emoji")?;

                        emotes.push(UniChatEmote {
                            id: emoji_id.clone(),
                            emote_type: shortcut.clone(),
                            tooltip: shortcut.clone(),
                            url: last_image.url.clone()
                        });
                    },
                    Emoji::FontBased { emoji_id, image, .. } => {
                        let last_image = image.thumbnails.last().ok_or("No thumbnails found for font-based emoji")?;
                        emotes.push(UniChatEmote {
                            id: emoji_id.clone(),
                            emote_type: emoji_id.clone(),
                            tooltip: emoji_id.clone(),
                            url: last_image.url.clone()
                        });
                    }
                }
            }
        }
    }

    if let Some(bttv_emotes) = BTTV_EMOTES_HASHSET.get() {
        if let Ok(guard) = bttv_emotes.read() {
            emotes.extend(guard.iter().cloned());
        }
    }

    return Ok(emotes);
}

pub fn parse_message_string(message_runs: &MessageRunsWrapper) -> Result<String, Box<dyn std::error::Error>> {
    let mut str_message = Vec::new();

    for run in &message_runs.runs {
        match run {
            MessageRun::Text { text } => {
                str_message.push(text.clone());
            },
            MessageRun::Emoji { emoji } => {
                match emoji {
                    Emoji::Custom { shortcuts, .. } => {
                        let shortcut = shortcuts.first().ok_or("No shortcuts found for custom emoji")?;
                        str_message.push(shortcut.clone());
                    },
                    Emoji::FontBased { emoji_id, .. } => {
                        str_message.push(emoji_id.clone());
                    }
                }
            }
        }
    }

    return Ok(str_message.join(" "));
}
