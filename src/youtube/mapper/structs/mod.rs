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

use serde::Deserialize;
use serde::Serialize;

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
    if url.contains("ggpht.com/") {
        let path = url.split("ggpht.com/").collect::<Vec<&str>>()[1];

        return format!("/ytimg/{}", path);
    }

    return url.to_string();
}
