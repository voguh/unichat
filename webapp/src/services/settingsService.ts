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
    /* General settings */
    DEFAULT_PREVIEW_WIDGET = "default-preview-widget",
    OPEN_TO_LAN = "open-to-lan",

    /* Developers settings */
    CREATE_WEBVIEW_HIDDEN = "create-webview-hidden",
    LOG_SCRAPER_EVENTS = "log-scraper-events",

    /* Tour steps */
    PREVIOUS_TOUR_STEPS = "previous-tour-steps",
    CURRENT_TOUR_STEPS = "current-tour-steps"
}

export interface UniChatSettings {
    /* General settings */
    [UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET]: string;
    [UniChatSettingsKeys.OPEN_TO_LAN]: boolean;

    /* Developers settings */
    [UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN]: boolean;
    [UniChatSettingsKeys.LOG_SCRAPER_EVENTS]: ScraperEventsLogLevel;

    /* Tour steps */
    [UniChatSettingsKeys.CURRENT_TOUR_STEPS]: string[];
    [UniChatSettingsKeys.PREVIOUS_TOUR_STEPS]: string[];

    /* Allow for future settings without breaking the type */
    [key: string]: any;
}

export class SettingsService {
    public async getItem<K extends keyof UniChatSettings>(key: K): Promise<UniChatSettings[K]> {
        return invoke<UniChatSettings[K]>("settings_get_item", { key });
    }

    public async setItem<K extends keyof UniChatSettings>(key: K, value: UniChatSettings[K]): Promise<void> {
        await invoke("settings_set_item", { key, value });
    }

    public async getItems<K extends keyof UniChatSettings>(keys: K[]): Promise<Pick<UniChatSettings, K>> {
        return invoke<Pick<UniChatSettings, K>>("settings_get_items", { keys });
    }

    public async setItems<K extends keyof UniChatSettings>(items: Pick<UniChatSettings, K>): Promise<void> {
        await invoke("settings_set_items", { items });
    }
}

export const settingsService = new SettingsService();
