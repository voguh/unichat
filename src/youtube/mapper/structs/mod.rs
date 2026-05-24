/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde::Deserialize;
use serde::Serialize;

use crate::utils::base64;

pub mod author;
pub mod message;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailsWrapper {
    pub thumbnails: Vec<Thumbnail>
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Thumbnail {
    pub url: String,
    pub width: Option<u32>,
    pub height: Option<u32>
}

pub fn proxy_youtube_url(url: &str) -> String {
    return format!("/proxy/{}?referer=https://www.youtube.com/", base64::url_safe_encode(url));
}
