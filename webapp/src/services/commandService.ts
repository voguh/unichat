/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { ComboboxItemGroup } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";

import { AppMetadata, GalleryItem, UniChatScrapper, WidgetFields } from "unichat/types";

export class CommandService {
    public async dispatchClearChat(): Promise<void> {
        await invoke("dispatch_clear_chat");
    }

    public async getAppInfo(): Promise<AppMetadata> {
        return invoke("get_app_info");
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

    public async getScrappers(): Promise<UniChatScrapper[]> {
        return invoke("get_scrappers");
    }

    public async getScrapper(id: string): Promise<UniChatScrapper> {
        return invoke("get_scrapper", { id });
    }

    public async validateScrapperUrl(id: string, url: string): Promise<string> {
        return invoke("validate_scrapper_url", { id, url });
    }

    public async getScrapperStoredUrl(label: string): Promise<string> {
        return this.storeGetItem(`scrapper:${label}:url`);
    }

    public async getScrapperWebviewUrl(label: string): Promise<string> {
        return invoke("get_scrapper_webview_url", { label });
    }

    public async setScrapperWebviewUrl(label: string, url: string): Promise<void> {
        await invoke("set_scrapper_webview_url", { label, url });
    }

    public async toggleScrapperWebview(label: string): Promise<boolean> {
        return invoke("toggle_scrapper_webview", { label });
    }

    /* ========================================================================================== */

    public async getWidgetFields(widget: string): Promise<Record<string, WidgetFields>> {
        const data = await invoke<string>("get_widget_fields", { widget });

        return JSON.parse(data);
    }

    public async getWidgetFieldState(widget: string): Promise<Record<string, any>> {
        const data = await invoke<string>("get_widget_fieldstate", { widget });

        return JSON.parse(data);
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
