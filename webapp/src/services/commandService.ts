/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { ComboboxItemGroup } from "@mantine/core";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";

import { AppMetadata, GalleryItem, UniChatPluginMetadata, UniChatScraper, WidgetFields } from "unichat/types";
import { UniChatSettings } from "unichat/utils/constants";

async function invoke<T>(cmd: string, args?: Record<string, any>): Promise<T> {
    try {
        return tauriInvoke<T>(cmd, args);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(String(error));
        }
    }
}

export class CommandService {
    public async dispatchClearChat(): Promise<void> {
        await invoke("dispatch_clear_chat");
    }

    public async getAppInfo(): Promise<AppMetadata> {
        return invoke("get_app_info");
    }

    public async getReleases(): Promise<Record<string, any>[]> {
        return invoke("get_releases");
    }

    public async getSystemHosts(): Promise<string[]> {
        return invoke("get_system_hosts");
    }

    public async isDev(): Promise<boolean> {
        return invoke("is_dev");
    }

    /* ========================================================================================== */

    public async getGalleryItems(): Promise<GalleryItem[]> {
        return invoke("get_gallery_items");
    }

    public async uploadGalleryItems(files: string[]): Promise<void> {
        await invoke("upload_gallery_items", { files });
    }

    /* ========================================================================================== */

    public async getPlugins(): Promise<UniChatPluginMetadata[]> {
        return invoke("get_plugins");
    }

    public async togglePluginState(pluginName: string, newState: boolean): Promise<void> {
        await invoke("toggle_plugin_state", { pluginName, newState });
    }

    /* ========================================================================================== */

    public async settingsGetItem<T = object>(key: UniChatSettings): Promise<T> {
        return invoke("settings_get_item", { key });
    }

    public async settingsSetItem<T = object>(key: UniChatSettings, value: T): Promise<void> {
        await invoke("settings_set_item", { key, value });
    }

    public async storeGetItem<T = object>(key: string): Promise<T> {
        return invoke("store_get_item", { key });
    }

    /* ========================================================================================== */

    public async getPrevTourSteps(): Promise<string[]> {
        return invoke("get_prev_tour_steps");
    }

    public async getTourSteps(): Promise<string[]> {
        return invoke("get_tour_steps");
    }

    public async setTourSteps(newSteps: string[]): Promise<void> {
        return invoke("set_tour_steps", { newSteps });
    }

    public async tourStepsHasNew(): Promise<boolean> {
        return invoke("tour_steps_has_new");
    }

    /* ========================================================================================== */

    public async getScrapers(): Promise<UniChatScraper[]> {
        return invoke("get_scrapers");
    }

    public async getScraper(scraperId: string): Promise<UniChatScraper> {
        return invoke("get_scraper", { scraperId });
    }

    public async validateScraperUrl(scraperId: string, url: string): Promise<string> {
        return invoke("validate_scraper_url", { scraperId, url });
    }

    public async getScraperStoredUrl(scraperId: string): Promise<string | null> {
        return invoke("get_scraper_stored_url", { scraperId });
    }

    public async getScraperWebviewUrl(scraperId: string): Promise<string> {
        return invoke("get_scraper_webview_url", { scraperId });
    }

    public async setScraperWebviewUrl(scraperId: string, url: string): Promise<void> {
        await invoke("set_scraper_webview_url", { scraperId, url });
    }

    public async toggleScraperWebview(scraperId: string): Promise<boolean> {
        return invoke("toggle_scraper_webview", { scraperId });
    }

    /* ========================================================================================== */

    public async getWidgetFields(widget: string): Promise<Record<string, WidgetFields>> {
        return invoke<Record<string, WidgetFields>>("get_widget_fields", { widget });
    }

    public async getWidgetFieldState(widget: string): Promise<Record<string, any>> {
        return invoke<Record<string, any>>("get_widget_fieldstate", { widget });
    }

    public async listWidgets(): Promise<ComboboxItemGroup<string>[]> {
        return invoke("list_widgets");
    }

    public async setWidgetFieldState(widget: string, fieldstate: Record<string, any>): Promise<void> {
        const data = JSON.stringify(fieldstate);
        await invoke("set_widget_fieldstate", { widget, data });
    }
}

export const commandService = new CommandService();
