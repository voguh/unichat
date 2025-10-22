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

import { AppMetadata, WidgetFields } from "unichat/types";

export class YouTubeCommandService {
    public async getScrapperUrl(): Promise<string> {
        return invoke("get_youtube_scrapper_url");
    }

    public async setScrapperUrl(url: string): Promise<void> {
        await invoke("set_youtube_scrapper_url", { url });
    }
}

export class TwitchCommandService {
    public async getScrapperUrl(): Promise<string> {
        return invoke("get_twitch_scrapper_url");
    }

    public async setScrapperUrl(url: string): Promise<void> {
        await invoke("set_twitch_scrapper_url", { url });
    }
}

export class CommandService {
    public get youTube(): YouTubeCommandService {
        return new YouTubeCommandService();
    }

    public get twitch(): TwitchCommandService {
        return new TwitchCommandService();
    }

    public async getAppInfo(): Promise<AppMetadata> {
        return invoke("get_app_info");
    }

    public async tourStepsHasNew(): Promise<boolean> {
        return invoke("tour_steps_has_new");
    }

    public async getPrevTourSteps(): Promise<string[]> {
        return invoke("get_prev_tour_steps");
    }

    public async getTourSteps(): Promise<string[]> {
        return invoke("get_tour_steps");
    }

    public async setTourSteps(newSteps: string[]): Promise<void> {
        return invoke("set_tour_steps", { newSteps });
    }

    public async isDev(): Promise<boolean> {
        return invoke("is_dev");
    }

    public async toggleWebview(label: string): Promise<boolean> {
        return invoke("toggle_webview", { label });
    }

    public async dispatchClearChat(): Promise<void> {
        await invoke("dispatch_clear_chat");
    }

    public async listWidgets(): Promise<ComboboxItemGroup<string>[]> {
        return invoke("list_widgets");
    }

    public async getWidgetFields(widget: string): Promise<Record<string, WidgetFields>> {
        const data = await invoke<string>("get_widget_fields", { widget });

        return JSON.parse(data);
    }

    public async getWidgetFieldState(widget: string): Promise<Record<string, any>> {
        const data = await invoke<string>("get_widget_fieldstate", { widget });

        return JSON.parse(data);
    }

    public async setWidgetFieldState(widget: string, fieldstate: Record<string, any>): Promise<void> {
        const data = JSON.stringify(fieldstate);
        await invoke("set_widget_fieldstate", { widget, data });
    }
}

export const commandService = new CommandService();
