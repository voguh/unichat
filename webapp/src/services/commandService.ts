/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { invoke as tauriInvoke } from "@tauri-apps/api/core";

import {
    GalleryItem,
    UniChatPluginMetadata,
    UniChatScraper,
    UniChatWidget,
    UniChatWidgetGroup,
    WidgetFields
} from "unichat/types";
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

    public async getSystemHosts(): Promise<string[]> {
        return invoke("get_system_hosts");
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

    public async setWidgetFieldState(widget: string, fieldstate: Record<string, any>): Promise<void> {
        const data = JSON.stringify(fieldstate);
        await invoke("set_widget_fieldstate", { widget, data });
    }

    public async listDetailedWidgets(): Promise<UniChatWidget[]> {
        return invoke<UniChatWidget[]>("list_detailed_widgets");
    }

    public async listWidgets(): Promise<UniChatWidgetGroup[]> {
        return invoke("list_widgets");
    }

    public async reloadWidgets(): Promise<void> {
        await invoke("reload_widgets");
    }
}

export const commandService = new CommandService();
