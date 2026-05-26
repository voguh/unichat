/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { Button } from "unichat/components/Button";
import { FormGroup } from "unichat/components/forms/FormGroup";
import { Switch } from "unichat/components/forms/Switch";
import { useStorage } from "unichat/hooks/useStorage";
import {
    ScraperEventsLogLevel as LogLevel,
    settingsService,
    UniChatSettings,
    UniChatSettingsKeys
} from "unichat/services/settingsService";
import { StorageKeys } from "unichat/services/storageService";

import { DevelopersSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function DevelopersSettingsTab(_props: Props): PReact.ComponentChildren {
    const [dirty, setDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState<Partial<UniChatSettings>>({});

    const createWebviewsHiddenRef = useRef<HTMLInputElement>(null);
    const [logEventsRef, setLogEventsRef] = useState(LogLevel.UNKNOWN_EVENTS);

    const [requiresRestart, setRequiresRestart] = useStorage(StorageKeys.REQUIRES_RESTART);

    function changeLogEvents(logLevel: LogLevel): void {
        setLogEventsRef(logLevel);
        setDirty(true);
    }

    async function applySettings(): Promise<void> {
        const beforeCreateWebviewsHidden = initialSettings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN];
        const settingsCopy = { ...initialSettings };

        if (createWebviewsHiddenRef.current) {
            settingsCopy[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] = createWebviewsHiddenRef.current.checked;
        }

        if (logEventsRef) {
            settingsCopy[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] = logEventsRef;
        }

        await settingsService.setItems(settingsCopy);
        setInitialSettings(settingsCopy);
        setDirty(false);

        if (beforeCreateWebviewsHidden !== settingsCopy[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN]) {
            setRequiresRestart(true);
        }
    }

    useEffect(() => {
        if (Object.keys(initialSettings).length === 0) {
            return;
        }

        function changeDirty(this: HTMLInputElement): void {
            setDirty(true);
            this.removeEventListener("change", changeDirty);
        }

        if (createWebviewsHiddenRef.current) {
            createWebviewsHiddenRef.current.addEventListener("change", changeDirty);
        }

        return () => {
            if (createWebviewsHiddenRef.current) {
                createWebviewsHiddenRef.current.removeEventListener("change", changeDirty);
            }
        };
    }, [initialSettings]);

    useEffect(() => {
        async function init(): Promise<void> {
            const settings = await settingsService.getItems([
                UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN,
                UniChatSettingsKeys.LOG_SCRAPER_EVENTS
            ]);

            if (logEventsRef) {
                setLogEventsRef(settings[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] ?? LogLevel.ONLY_ERRORS);
            }

            setInitialSettings(settings);
        }

        init();
    }, []);

    return (
        <DevelopersSettingsTabStyledContainer key={Object.keys(initialSettings).length === 0 ? "loading" : "loaded"}>
            <div className="create-webview-hidden-section">
                <Switch
                    defaultChecked={initialSettings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] ?? false}
                    inputRef={createWebviewsHiddenRef}
                    label="Create webviews silent"
                    description="On startup, webviews will be created in background and only shown when requested."
                />

                {requiresRestart && (
                    <div className="alert alert-primary">
                        <div>
                            <i className="fas fa-info-circle" />
                        </div>
                        <span>
                            <strong>{UNICHAT_DISPLAY_NAME}</strong> must be restarted for this setting to take effect.
                        </span>
                    </div>
                )}
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
                <div className="scraperLogging_section--buttons">
                    <Button
                        variant={logEventsRef === LogLevel.ONLY_ERRORS ? "primary" : "default"}
                        disabled={__IS_DEV__ || logEventsRef === "ONLY_ERRORS"}
                        onClick={() => changeLogEvents(LogLevel.ONLY_ERRORS)}
                    >
                        Only Errors
                    </Button>
                    <Button
                        variant={logEventsRef === LogLevel.UNKNOWN_EVENTS ? "primary" : "default"}
                        disabled={__IS_DEV__ || logEventsRef === LogLevel.UNKNOWN_EVENTS}
                        onClick={() => changeLogEvents(LogLevel.UNKNOWN_EVENTS)}
                    >
                        Errors + Unknown Events
                    </Button>
                    <Button
                        variant={logEventsRef === LogLevel.ALL_EVENTS ? "primary" : "default"}
                        disabled={__IS_DEV__ || logEventsRef === LogLevel.ALL_EVENTS}
                        onClick={() => changeLogEvents(LogLevel.ALL_EVENTS)}
                    >
                        Errors + All Events
                    </Button>
                </div>
            </FormGroup>

            <div className="developers_settings--footer">
                <Button variant="success" disabled={!dirty} onClick={applySettings}>
                    Apply
                </Button>
            </div>
        </DevelopersSettingsTabStyledContainer>
    );
}
