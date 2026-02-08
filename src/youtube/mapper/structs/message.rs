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
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEmote;
use crate::shared_emotes;
use crate::youtube::mapper::structs::proxy_youtube_url;
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

pub fn parse_super_chat_tier(primary_superchat_background_color: &str) -> Option<u8> {
    if primary_superchat_background_color.contains("230, 33, 23") {
        return Some(7);
    } else if primary_superchat_background_color.contains("233, 30, 99") {
        return Some(6);
    } else if primary_superchat_background_color.contains("245, 124, 0") {
        return Some(5);
    } else if primary_superchat_background_color.contains("255, 202, 40") {
        return Some(4);
    } else if primary_superchat_background_color.contains("29, 233, 182") {
        return Some(3);
    } else if primary_superchat_background_color.contains("0, 229, 255") {
        return Some(2);
    } else if primary_superchat_background_color.contains("30, 136, 229") {
        return Some(1);
    } else {
        return None;
    }
}

pub fn parse_message_emojis(message_runs: &MessageRunsWrapper) -> Result<Vec<UniChatEmote>, Error> {
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
                            let shortcut = shortcuts.first().ok_or(anyhow!("No shortcuts found for custom emoji"))?;
                            let last_image = image.thumbnails.last().ok_or(anyhow!("No thumbnails found for font-based emoji"))?;

                            emotes.push(UniChatEmote {
                                id: emoji_id.clone(),
                                code: shortcut.clone(),
                                url: proxy_youtube_url(&last_image.url)
                            });
                        },
                        Emoji::FontBased { emoji_id, image, .. } => {
                            let last_image = image.thumbnails.last().ok_or(anyhow!("No thumbnails found for font-based emoji"))?;
                            emotes.push(UniChatEmote {
                                id: emoji_id.clone(),
                                code: emoji_id.clone(),
                                url: proxy_youtube_url(&last_image.url)
                            });
                        }
                    }
                }
            }
        }
    }

    return Ok(emotes);
}

pub fn parse_message_string(message_runs: &MessageRunsWrapper) -> Result<String, Error> {
    let mut str_message = Vec::new();

    for run in &message_runs.runs {
        match run {
            MessageRun::Text { text } => {
                str_message.push(text.clone());
            },
            MessageRun::Emoji { emoji } => {
                match emoji {
                    Emoji::Custom { shortcuts, .. } => {
                        let shortcut = shortcuts.first().ok_or(anyhow!("No shortcuts found for custom emoji"))?;
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
