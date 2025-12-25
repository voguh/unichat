/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export const WIDGET_URL_PREFIX = "http://localhost:9527/widget";

export const TWITCH_SCRAPPER_ID = "twitch-chat";
export const YOUTUBE_SCRAPPER_ID = "youtube-chat";

export function scrapperPriority(id: string): number {
    if (id === YOUTUBE_SCRAPPER_ID) {
        return 0;
    } else if (id === TWITCH_SCRAPPER_ID) {
        return 1;
    } else {
        return 2;
    }
}
