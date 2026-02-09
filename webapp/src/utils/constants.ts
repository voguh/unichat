/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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

/**
 * Plugin statuses.
 *
 * - LOADED: The plugin is valid and loaded but not yet active.
 * - INVALID: The plugin is invalid due to missing or incorrect dependencies or structure.
 * - ACTIVE: The plugin is active and running.
 * - ERROR: The plugin encountered an error during loading or execution.
 */
export enum PluginStatus {
    LOADED = "LOADED",
    INVALID = "INVALID",
    ACTIVE = "ACTIVE",
    ERROR = "ERROR"
}

export const PLUGIN_STATUS_COLOR = {
    [PluginStatus.LOADED]: ["var(--oc-yellow-8)", "var(--oc-black)"],
    [PluginStatus.INVALID]: ["var(--oc-red-8)", "var(--oc-black)"],
    [PluginStatus.ACTIVE]: ["var(--oc-green-8)", "var(--oc-black)"],
    [PluginStatus.ERROR]: ["var(--oc-red-8)", "var(--oc-black)"]
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

export enum WidgetSourceType {
    SYSTEM = "SYSTEM",
    SYSTEM_PLUGIN = "SYSTEM_PLUGIN",
    USER_PLUGIN = "USER_PLUGIN",
    USER = "USER"
}
