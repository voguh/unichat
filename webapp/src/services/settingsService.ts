/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { invoke } from "@tauri-apps/api/core";

export enum ScraperEventsLogLevel {
    ONLY_ERRORS = "ONLY_ERRORS",
    UNKNOWN_EVENTS = "UNKNOWN_EVENTS",
    ALL_EVENTS = "ALL_EVENTS"
}

export enum UniChatSettingsKeys {
    CURRENT_TOUR_STEPS = "current-tour-steps",
    PREVIOUS_TOUR_STEPS = "previous-tour-steps",
    DEFAULT_PREVIEW_WIDGET = "default-preview-widget",
    OPEN_TO_LAN = "open-to-lan",

    /* Developers settings */
    CREATE_WEBVIEW_HIDDEN = "create-webview-hidden",
    LOG_SCRAPER_EVENTS = "log-scraper-events"
}

export interface UniChatSettings {
    [UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN]: boolean;
    [UniChatSettingsKeys.CURRENT_TOUR_STEPS]: string[];
    [UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET]: string;
    [UniChatSettingsKeys.LOG_SCRAPER_EVENTS]: ScraperEventsLogLevel;
    [UniChatSettingsKeys.OPEN_TO_LAN]: boolean;
    [UniChatSettingsKeys.PREVIOUS_TOUR_STEPS]: string[];
    [key: string]: any;
}

export class SettingsService {
    public async getItem<K extends keyof UniChatSettings>(key: K): Promise<UniChatSettings[K]> {
        return invoke<UniChatSettings[K]>("settings_get_item", { key });
    }

    public async setItem<K extends keyof UniChatSettings>(key: K, value: UniChatSettings[K]): Promise<void> {
        await invoke("settings_set_item", { key, value });
    }
}

export const settingsService = new SettingsService();
