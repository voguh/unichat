/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;

use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Error> {
    let banner_renderer = value.get("bannerRenderer").ok_or(anyhow!("No bannerRenderer found"))?;

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        return live_chat_banner_renderer::parse(value.clone())
    }

    return Ok(None);
}
