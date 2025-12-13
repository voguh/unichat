/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use crate::error::Error;
use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let banner_renderer = value.get("bannerRenderer").ok_or("No bannerRenderer found")?;

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        return live_chat_banner_renderer::parse(value.clone())
    }

    return Ok(None);
}
