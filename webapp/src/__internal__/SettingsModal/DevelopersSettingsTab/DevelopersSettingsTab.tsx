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

export function DevelopersSettingsTab(_props: Props): PReact.ComponentChildren {
    const [dirty, setDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState<Partial<UniChatSettings>>({});

    const createWebviewsHiddenRef = useRef<HTMLInputElement>(null);
    const [logEventsRef, setLogEventsRef] = useState(LogLevel.UNKNOWN_EVENTS);

    function changeLogEvents(logLevel: LogLevel): void {
        setLogEventsRef(logLevel);
        setDirty(true);
    }

    async function applySettings(): Promise<void> {
        const settingsCopy = { ...initialSettings };

        if (createWebviewsHiddenRef.current) {
            settingsCopy[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] = createWebviewsHiddenRef.current.checked;
        }

        if (logEventsRef) {
            settingsCopy[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] = logEventsRef;
        }

        await settingsService.setItems(settingsCopy);
        setInitialSettings(settingsCopy);
    }

    useEffect(() => {
        function changeDirty(this: HTMLInputElement): void {
            setDirty(true);
            this.removeEventListener("change", changeDirty);
        }

        async function init(): Promise<void> {
            const settings = await settingsService.getItems([
                UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN,
                UniChatSettingsKeys.LOG_SCRAPER_EVENTS
            ]);

            if (createWebviewsHiddenRef.current) {
                createWebviewsHiddenRef.current.checked = settings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] ?? false;
                createWebviewsHiddenRef.current.addEventListener("change", changeDirty);
            }

            if (logEventsRef) {
                setLogEventsRef(settings[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] ?? LogLevel.ONLY_ERRORS);
            }

            setInitialSettings(settings);
        }

        init();
    }, []);

    return (
        <DevelopersSettingsTabStyledContainer>
            <div className="create-webview-hidden-section">
                <Switch
                    inputRef={createWebviewsHiddenRef}
                    label="Create webviews silent"
                    description="On startup, webviews will be created in background and only shown when requested."
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
