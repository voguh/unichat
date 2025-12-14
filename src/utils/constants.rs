/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::LazyLock;

pub const BASE_REST_PORT: u16 = 9527;
pub const YOUTUBE_CHAT_WINDOW: &str = "youtube-chat";
pub const TWITCH_CHAT_WINDOW: &str = "twitch-chat";

pub static CHAT_WINDOWS: LazyLock<[&str; 2]> = LazyLock::new(|| [YOUTUBE_CHAT_WINDOW, TWITCH_CHAT_WINDOW]);
