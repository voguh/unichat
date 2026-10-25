/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { Button } from "@voguh/unichat-ui/Button";
import { FormGroup } from "@voguh/unichat-ui/forms/FormGroup";
import { Switch } from "@voguh/unichat-ui/forms/Switch";
import { SegmentedControl } from "@voguh/unichat-ui/SegmentedControl";
import { useStorage } from "unichat/hooks/useStorage";
import {
    ScraperEventsLogLevel as LogLevel,
    settingsService,
    type UniChatSettings,
    UniChatSettingsKeys
} from "unichat/services/settingsService";
import { StorageKeys } from "unichat/services/storageService";

import styles from "./styles.module.css";

interface Props {
    onClose: () => void;
}

export function DevelopersSettingsTab(_props: Props): PReact.ComponentChildren {
    const [dirty, setDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState<Partial<UniChatSettings>>({});

    const createWebviewsHiddenRef = useRef<HTMLInputElement>(null);
    const [logEventsRef, setLogEventsRef] = useState(LogLevel.UNKNOWN_EVENTS);
    const openScraperWebviewRef = useRef<HTMLInputElement>(null);

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

        if (openScraperWebviewRef.current) {
            settingsCopy[UniChatSettingsKeys.OPEN_SCRAPER_WEBVIEW] = openScraperWebviewRef.current.checked;
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

        if (openScraperWebviewRef.current) {
            openScraperWebviewRef.current.addEventListener("change", changeDirty);
        }

        return () => {
            if (createWebviewsHiddenRef.current) {
                createWebviewsHiddenRef.current.removeEventListener("change", changeDirty);
            }

            if (openScraperWebviewRef.current) {
                openScraperWebviewRef.current.removeEventListener("change", changeDirty);
            }
        };
    }, [initialSettings]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        async function init(): Promise<void> {
            const settings = await settingsService.getItems([
                UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN,
                UniChatSettingsKeys.LOG_SCRAPER_EVENTS,
                UniChatSettingsKeys.OPEN_SCRAPER_WEBVIEW
            ]);

            if (logEventsRef) {
                setLogEventsRef(settings[UniChatSettingsKeys.LOG_SCRAPER_EVENTS] ?? LogLevel.ONLY_ERRORS);
            }

            setInitialSettings(settings);
        }

        init();
    }, []);

    return (
        <div className={styles.root} key={Object.keys(initialSettings).length === 0 ? "loading" : "loaded"}>
            <div className="body">
                <div>
                    <Switch
                        defaultChecked={initialSettings[UniChatSettingsKeys.CREATE_WEBVIEW_HIDDEN] ?? false}
                        ref={createWebviewsHiddenRef}
                        label="Create webviews silent"
                        description="On startup, webviews will be created in background and only shown when requested"
                    />

                    {requiresRestart && (
                        <div className="alert">
                            <div>
                                <i className="fas fa-info-circle" />
                            </div>
                            <span>
                                <strong>{UNICHAT_DISPLAY_NAME}</strong> must be restarted for this setting to take
                                effect.
                            </span>
                        </div>
                    )}
                </div>

                <div>
                    <Switch
                        defaultChecked={initialSettings[UniChatSettingsKeys.OPEN_SCRAPER_WEBVIEW] ?? false}
                        ref={openScraperWebviewRef}
                        disabled={__IS_DEV__}
                        label="Open Scraper Webview"
                        description={
                            <>
                                Adds a button to scraper cards that opens the scraper webview window
                                {__IS_DEV__ && " (Developer mode is enabled, this feature is always available)"}
                            </>
                        }
                    />
                </div>

                <hr />

                <FormGroup
                    label="Scraper log events"
                    description={
                        <>
                            Choose the level of detail for scraper logging
                            {__IS_DEV__ && " (Developer mode is enabled, all events will be logged)"}
                        </>
                    }
                >
                    <SegmentedControl
                        value={logEventsRef}
                        disabled={__IS_DEV__}
                        onChange={(event) => changeLogEvents(event.currentTarget.value as LogLevel)}
                        items={[
                            { value: LogLevel.ONLY_ERRORS, label: "Only Errors" },
                            { value: LogLevel.UNKNOWN_EVENTS, label: "Errors + Unknown Events" },
                            { value: LogLevel.ALL_EVENTS, label: "Errors + All Events" }
                        ]}
                    />
                </FormGroup>
            </div>

            <div className="footer">
                <Button variant="success" disabled={!dirty} onClick={applySettings}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
