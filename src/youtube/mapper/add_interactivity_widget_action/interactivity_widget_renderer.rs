/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use serde::Deserialize;
use serde::Serialize;

use crate::events::unichat::UniChatEvent;
use crate::youtube::mapper::structs::Thumbnail;
use crate::youtube::mapper::structs::ThumbnailsWrapper;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct InteractivityWidgetRenderer {
    id: String,
    #[serde(rename = "type")]
    widget_type: String,
    preload_images: Vec<PreloadImage>,
    content: Content,
    position: Position,
    timeout_ms: u64,
    enter_animation: String,
    exit_animation: String,
    priority: i32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct PreloadImage {
    image: ThumbnailsWrapper,
    image_display_width: u32,
    image_display_height: u32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Content {
    gift_attribution_item_view_model: GiftAttributionItemViewModel,
    element_renderer: ElementRenderer,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct GiftAttributionItemViewModel {
    id: String,
    author_name: TextContent,
    author_avatar: AuthorAvatar,
    detail_text: TextContent,
    attribution_image: SourceImage,
    gift_a11y_label: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct TextContent {
    content: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct AuthorAvatar {
    avatar_view_model: AvatarViewModel,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct AvatarViewModel {
    image: AvatarImage,
    avatar_image_size: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct AvatarImage {
    sources: Vec<Thumbnail>,
    processor: ImageProcessor,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ImageProcessor {
    border_image_processor: BorderImageProcessor,
}

#[derive(Serialize, Deserialize, Debug)]
struct BorderImageProcessor {
    circular: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct SourceImage {
    sources: Vec<Thumbnail>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ElementRenderer {
    compatibility_options: CompatibilityOptions,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CompatibilityOptions {
    live_chat_id: String,
    live_chat_author_external_channel_id: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Position {
    width: String,
    height: String,
    special_placement: String,
}

pub fn parse(value: serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let parsed: InteractivityWidgetRenderer = serde_json::from_value(value)?;

    return Ok(None);
}
