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

import { Select } from "@voguh/unichat-ui/components/forms/Select";
import { Switch } from "@voguh/unichat-ui/components/forms/Switch";
import { Button, ButtonLink } from "@voguh/unichat-ui/components/ui/Button";
import type { SelectItem } from "@voguh/unichat-ui/components/ui/Select";
import { useStorage } from "unichat/hooks/useStorage";
import { useWidgets } from "unichat/hooks/useWidgets";
import { commandService } from "unichat/services/commandService";
import { type EventEmitterEvents, eventEmitter } from "unichat/services/eventEmitter";
import { settingsService, type UniChatSettings, UniChatSettingsKeys } from "unichat/services/settingsService";
import { StorageKeys } from "unichat/services/storageService";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import styles from "./styles.module.css";

const CURRENCY_DISABLED_OPTION: SelectItem = { value: "", label: "Disabled" };

interface Props {
    onClose: () => void;
}

export function GeneralSettingsTab({ onClose }: Props): PReact.ComponentChildren {
    const [widgets, _reloadWidgets] = useWidgets(toWidgetOptionGroup, []);
    const [currencies, setCurrencies] = useState<SelectItem[]>([CURRENCY_DISABLED_OPTION]);

    const [dirty, setDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState<Partial<UniChatSettings>>({});
    const selectRef = useRef<HTMLSelectElement>(null);
    const openToLanRef = useRef<HTMLInputElement>(null);
    const currencyRef = useRef<HTMLSelectElement>(null);

    const [requiresRestart, setRequiresRestart] = useStorage(StorageKeys.REQUIRES_RESTART);

    async function applySettings(): Promise<void> {
        const beforeOpenToLan = initialSettings[UniChatSettingsKeys.OPEN_TO_LAN];
        const settingsCopy = { ...initialSettings };
        if (selectRef.current != null) {
            const value = selectRef.current.value;
            settingsCopy[UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET] = value;
        }

        if (openToLanRef.current != null) {
            const checked = openToLanRef.current.checked;

            settingsCopy[UniChatSettingsKeys.OPEN_TO_LAN] = checked;
        }

        if (currencyRef.current != null) {
            const value = currencyRef.current.value;
            settingsCopy[UniChatSettingsKeys.CURRENCY_TARGET] = value;
        }

        await settingsService.setItems(settingsCopy);
        setInitialSettings(settingsCopy);
        setDirty(false);

        if (beforeOpenToLan !== settingsCopy[UniChatSettingsKeys.OPEN_TO_LAN]) {
            setRequiresRestart(true);
        }
    }

    function dispatchTour(type: EventEmitterEvents["tour:start"]["type"]): void {
        onClose();
        eventEmitter.emit("tour:start", { type });
    }

    useEffect(() => {
        if (Object.keys(initialSettings).length === 0) {
            return;
        }

        function changeDirty(this: HTMLElement): void {
            setDirty(true);
            this.removeEventListener("change", changeDirty);
        }

        if (selectRef.current) {
            selectRef.current.addEventListener("change", changeDirty);
        }

        if (openToLanRef.current) {
            openToLanRef.current.addEventListener("change", changeDirty);
        }

        if (currencyRef.current) {
            currencyRef.current.addEventListener("change", changeDirty);
        }

        return () => {
            if (selectRef.current) {
                selectRef.current.removeEventListener("change", changeDirty);
            }

            if (openToLanRef.current) {
                openToLanRef.current.removeEventListener("change", changeDirty);
            }

            if (currencyRef.current) {
                currencyRef.current.removeEventListener("change", changeDirty);
            }
        };
    }, [initialSettings]);

    useEffect(() => {
        async function init(): Promise<void> {
            const settings = await settingsService.getItems([
                UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET,
                UniChatSettingsKeys.OPEN_TO_LAN,
                UniChatSettingsKeys.CURRENCY_TARGET
            ]);

            setInitialSettings(settings);
        }

        init();
    }, []);

    useEffect(() => {
        async function loadCurrencies(): Promise<void> {
            try {
                const items = await commandService.getCurrencies();
                const options = items.map((item) => ({ value: item.code, label: `${item.code} / ${item.name}` }));

                setCurrencies([CURRENCY_DISABLED_OPTION, ...options]);
            } catch (error) {
                console.error("Failed to load the currency list", error);
            }
        }

        loadCurrencies();
    }, []);

    return (
        <div className={styles.container} key={Object.keys(initialSettings).length === 0 ? "loading" : "loaded"}>
            <div className={styles.body}>
                <Select
                    defaultValue={[initialSettings[UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET] ?? ""]}
                    ref={selectRef}
                    label="Default preview widget"
                    description="Select the default widget to be used in preview panels"
                    items={widgets}
                />

                <div data-tour="currency-target">
                    <Select
                        defaultValue={[initialSettings[UniChatSettingsKeys.CURRENCY_TARGET] ?? ""]}
                        ref={currencyRef}
                        label="Donation target currency"
                        items={currencies}
                    />
                    <small>
                        Powered by{" "}
                        <a target="_blank" rel="noopener noreferrer" href="https://frankfurter.dev">
                            Frankfurter
                        </a>
                    </small>
                </div>

                <hr />

                <div>
                    <Switch
                        defaultChecked={initialSettings[UniChatSettingsKeys.OPEN_TO_LAN] ?? false}
                        ref={openToLanRef}
                        label="Open to LAN"
                        description="Allow other devices on your local network view widgets"
                    />

                    {requiresRestart && (
                        <div className={styles.alert} data-variant="primary">
                            <div>
                                <i className="fas fa-info-circle" />
                            </div>
                            <span>
                                <strong>{UNICHAT_DISPLAY_NAME}</strong> must be restarted for this setting to take
                                effect.
                            </span>
                        </div>
                    )}
                    {openToLanRef.current?.checked && (
                        <div className={styles.alert} data-variant="warning">
                            <div>
                                <i className="fas fa-info-circle" />
                            </div>
                            <span>
                                Make sure your firewall allows incoming connections on port <strong>9527</strong>.
                            </span>
                        </div>
                    )}
                </div>

                <hr />

                <div>
                    Tour
                    <div className={styles.tourButtons}>
                        <Button variant="default" onClick={() => dispatchTour("full")}>
                            <i className="fas fa-compass" />
                            View Tour
                        </Button>
                        <Button variant="default" onClick={() => dispatchTour("whats-new")}>
                            <i className="fas fa-map" />
                            What&apos;s New?
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <Button variant="success" disabled={!dirty} onClick={applySettings}>
                    Apply
                </Button>
            </div>
        </div>
    );
}
