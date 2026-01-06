/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export const WIDGET_URL_PREFIX = "http://localhost:9527/widget";

export const TWITCH_SCRAPER_ID = "twitch-chat";
export const YOUTUBE_SCRAPER_ID = "youtube-chat";

export function scraperPriority(id: string): number {
    if (id === YOUTUBE_SCRAPER_ID) {
        return 0;
    } else if (id === TWITCH_SCRAPER_ID) {
        return 1;
    } else {
        return 2;
    }
}

export enum PluginStatus {
    LOADED = "LOADED",
    ERROR = "ERROR",
    ACTIVE = "ACTIVE"
}

export const PLUGIN_STATUS_COLOR = {
    [PluginStatus.LOADED]: ["var(--mantine-color-blue-5)", "var(--mantine-color-white)"],
    [PluginStatus.ERROR]: ["var(--mantine-color-red-5)", "var(--mantine-color-white)"],
    [PluginStatus.ACTIVE]: ["var(--mantine-color-green-5)", "var(--mantine-color-black)"]
};

export enum UniChatSettings {
    CURRENT_TOUR_STEPS = "current-tour-steps",
    PREVIOUS_TOUR_STEPS = "previous-tour-steps",
    DEFAULT_PREVIEW_WIDGET = "default-preview-widget",
    OPEN_TO_LAN = "open-to-lan",

    /* Developers settings */
    CREATE_WEBVIEW_HIDDEN = "create-webview-hidden",
    LOG_SCRAPER_EVENTS = "log-scraper-events"
}
