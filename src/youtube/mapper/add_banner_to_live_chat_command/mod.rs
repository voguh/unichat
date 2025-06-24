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

use crate::events::unichat::UniChatEvent;

mod live_chat_banner_renderer;

pub fn parse(value: &serde_json::Value) -> Result<Option<UniChatEvent>, Box<dyn std::error::Error>> {
    let banner_renderer = value.get("bannerRenderer").ok_or("No bannerRenderer found")?;

    if let Some(value) = banner_renderer.get("liveChatBannerRenderer") {
        return live_chat_banner_renderer::parse(value.clone())
    }

    return Ok(None);
}
