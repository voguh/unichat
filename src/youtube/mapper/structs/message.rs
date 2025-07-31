/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

use crate::shared_emotes;
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

    if let Ok(custom_emotes) = shared_emotes::EMOTES_HASHSET.read() {
        for run in &message_runs.runs {
            match run {
                MessageRun::Text { text } => {
                    if text.is_empty() {
                        continue;
                    }

                    for word in text.split_whitespace() {
                        if let Some(emote) = custom_emotes.get(word) {
                            emotes.push(emote.clone());
                        }
                    }
                },
                MessageRun::Emoji { emoji } => {
                    match emoji {
                        Emoji::Custom { emoji_id, image, shortcuts, .. } => {
                            let shortcut = shortcuts.first().ok_or("No shortcuts found for custom emoji")?;
                            let last_image = image.thumbnails.last().ok_or("No thumbnails found for font-based emoji")?;

                            emotes.push(UniChatEmote {
                                id: emoji_id.clone(),
                                code: shortcut.clone(),
                                url: last_image.url.clone()
                            });
                        },
                        Emoji::FontBased { emoji_id, image, .. } => {
                            let last_image = image.thumbnails.last().ok_or("No thumbnails found for font-based emoji")?;
                            emotes.push(UniChatEmote {
                                id: emoji_id.clone(),
                                code: emoji_id.clone(),
                                url: last_image.url.clone()
                            });
                        }
                    }
                }
            }
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
