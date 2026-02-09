/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { FormGroup } from "unichat/components/forms/FormGroup";
import { Switch } from "unichat/components/forms/Switch";
import { commandService } from "unichat/services/commandService";
import { UniChatSettings } from "unichat/utils/constants";

import { DevelopersSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function DevelopersSettingsTab(_props: Props): React.ReactNode {
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
            const createWebviewsHidden: boolean = await commandService.settingsGetItem(
                UniChatSettings.CREATE_WEBVIEW_HIDDEN
            );
            const logEvents: string = await commandService.settingsGetItem(UniChatSettings.LOG_SCRAPER_EVENTS);

            setSettings({
                [UniChatSettings.CREATE_WEBVIEW_HIDDEN]: createWebviewsHidden,
                [UniChatSettings.LOG_SCRAPER_EVENTS]: logEvents
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

            <hr />

            <FormGroup
                label="Scraper log events"
                description={
                    <>
                        Choose the level of detail for scraper logging{" "}
                        {__IS_DEV__ && "(Developer mode is enabled, so all events will be logged)"}.
                    </>
                }
                className="scraper-logging-section"
            >
                <ButtonGroup>
                    <Button
                        variant={settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "ONLY_ERRORS" ? "filled" : "default"}
                        disabled={__IS_DEV__ || settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "ONLY_ERRORS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPER_EVENTS, "ONLY_ERRORS")}
                    >
                        Only Errors
                    </Button>
                    <Button
                        variant={
                            settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "UNKNOWN_EVENTS" ? "filled" : "default"
                        }
                        disabled={__IS_DEV__ || settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "UNKNOWN_EVENTS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPER_EVENTS, "UNKNOWN_EVENTS")}
                    >
                        Errors + Unknown Events
                    </Button>
                    <Button
                        variant={settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "ALL_EVENTS" ? "filled" : "default"}
                        disabled={__IS_DEV__ || settings[UniChatSettings.LOG_SCRAPER_EVENTS] === "ALL_EVENTS"}
                        onClick={() => updateSetting(UniChatSettings.LOG_SCRAPER_EVENTS, "ALL_EVENTS")}
                    >
                        Errors + All Events
                    </Button>
                </ButtonGroup>
            </FormGroup>
        </DevelopersSettingsTabStyledContainer>
    );
}
