/*!******************************************************************************
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
import {
    ScraperEventsLogLevel as LogLevel,
    settingsService,
    UniChatSettings,
    UniChatSettingsKeys
} from "unichat/services/settingsService";

import { DevelopersSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function DevelopersSettingsTab(_props: Props): React.ReactNode {
    const [settings, setSettings] = React.useState({} as UniChatSettings);

    async function updateSetting<K extends keyof UniChatSettings>(key: K, value: UniChatSettings[K]): Promise<void> {
        const settingsCopy = { ...settings };
        if (settingsCopy[key] == null) {
            throw new Error(`Setting with key "${key}" does not exist.`);
        }

        settingsCopy[key] = value;
        setSettings(settingsCopy);
        await settingsService.setItem(key, value);
    }

    function getLogLevel(): LogLevel {
        return settings[UniChatSettingsKeys.LOG_SCRAPER_EVENTS];
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const createWebviewsHidden = await settingsService.getItem(UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN);
            const logEvents = await settingsService.getItem(UniChatSettingsKeys.LOG_SCRAPER_EVENTS);

            const newSettings = { ...settings };
            newSettings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] = createWebviewsHidden;
            newSettings[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] = logEvents;
            setSettings(newSettings);
        }

        init();
    }, []);

    return (
        <DevelopersSettingsTabStyledContainer>
            <div className="create-webview-hidden-section">
                <Switch
                    label="Create webviews silent"
                    description="On startup, webviews will be created in background and only shown when requested."
                    checked={settings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN]}
                    onChange={(evt) => updateSetting(UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN, evt.target.checked)}
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
                        variant={getLogLevel() === LogLevel.ONLY_ERRORS ? "filled" : "default"}
                        disabled={__IS_DEV__ || getLogLevel() === "ONLY_ERRORS"}
                        onClick={() => updateSetting(UniChatSettingsKeys.LOG_SCRAPER_EVENTS, LogLevel.ONLY_ERRORS)}
                    >
                        Only Errors
                    </Button>
                    <Button
                        variant={getLogLevel() === LogLevel.UNKNOWN_EVENTS ? "filled" : "default"}
                        disabled={__IS_DEV__ || getLogLevel() === LogLevel.UNKNOWN_EVENTS}
                        onClick={() => updateSetting(UniChatSettingsKeys.LOG_SCRAPER_EVENTS, LogLevel.UNKNOWN_EVENTS)}
                    >
                        Errors + Unknown Events
                    </Button>
                    <Button
                        variant={getLogLevel() === LogLevel.ALL_EVENTS ? "filled" : "default"}
                        disabled={__IS_DEV__ || getLogLevel() === LogLevel.ALL_EVENTS}
                        onClick={() => updateSetting(UniChatSettingsKeys.LOG_SCRAPER_EVENTS, LogLevel.ALL_EVENTS)}
                    >
                        Errors + All Events
                    </Button>
                </ButtonGroup>
            </FormGroup>
        </DevelopersSettingsTabStyledContainer>
    );
}
