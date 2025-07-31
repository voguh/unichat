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

import { AppMetadata } from "unichat/types";

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
}

export const commandService = new CommandService();
