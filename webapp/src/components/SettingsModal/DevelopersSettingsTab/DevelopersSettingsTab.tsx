/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, Divider, Switch, Text } from "@mantine/core";

import { commandService } from "unichat/services/commandService";
import { UniChatSettings } from "unichat/utils/constants";

import { DevelopersSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function DevelopersSettingsTab(_props: Props): React.ReactNode {
    const [isDev, setIsDev] = React.useState(false);
    const [settings, setSettings] = React.useState<Record<string, unknown>>({});

    async function updateSetting<T>(key: string, value: T): Promise<void> {
        const settingsCopy = { ...settings };
        if (settingsCopy[key] == null) {
            throw new Error(`Setting with key "${key}" does not exist.`);
        }

        settingsCopy[key] = value;
        setSettings(settingsCopy);
        await commandService.settingsSetItem(key as UniChatSettings, value);
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const isDev = await commandService.isDev();
            setIsDev(isDev);

            /* ============================================================== */

            const createWebviewsHidden: boolean = await commandService.settingsGetItem(
                UniChatSettings.CREATE_WEBVIEW_HIDDEN
            );
            const logEvents: string = await commandService.settingsGetItem(UniChatSettings.LOG_SCRAPPER_EVENTS);

            console.log("Fetched developer settings:", {
                createWebviewsHidden,
                logEvents
            });
            setSettings({
                [UniChatSettings.CREATE_WEBVIEW_HIDDEN]: createWebviewsHidden,
                [UniChatSettings.LOG_SCRAPPER_EVENTS]: logEvents
            });
        }

        init();
    }, []);

    return (
        <DevelopersSettingsTabStyledContainer>
            <div className="create-webview-hidden-section">
                <Switch
                    label="Create webviews silent"
                    description="On startup, webviews will be created in background and only shown when requested."
                    checked={settings[UniChatSettings.CREATE_WEBVIEW_HIDDEN] as boolean}
                    onChange={(evt) => updateSetting(UniChatSettings.CREATE_WEBVIEW_HIDDEN, evt.currentTarget.checked)}
                />
            </div>
            <Divider my="md" />

            <div className="scrapper-logging-section">
                <Text size="sm">Scrapper log events</Text>
                <Text size="xs" c="dimmed" mb="xs">
                    Choose the level of detail for scrapper logging{" "}
                    {isDev && "(Developer mode is enabled, so all events will be logged)"}.
                </Text>
                <Button.Group>
                    <Button
                        variant={settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "ONLY_ERRORS" ? "filled" : "default"}
                        disabled={isDev || settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "ONLY_ERRORS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPPER_EVENTS, "ONLY_ERRORS")}
                    >
                        Only Errors
                    </Button>
                    <Button
                        variant={
                            settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "UNKNOWN_EVENTS" ? "filled" : "default"
                        }
                        disabled={isDev || settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "UNKNOWN_EVENTS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPPER_EVENTS, "UNKNOWN_EVENTS")}
                    >
                        Errors + Unknown Events
                    </Button>
                    <Button
                        variant={settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "ALL_EVENTS" ? "filled" : "default"}
                        disabled={isDev || settings[UniChatSettings.LOG_SCRAPPER_EVENTS] === "ALL_EVENTS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPPER_EVENTS, "ALL_EVENTS")}
                    >
                        Errors + All Events
                    </Button>
                </Button.Group>
            </div>
        </DevelopersSettingsTabStyledContainer>
    );
}
