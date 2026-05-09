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
import { Select } from "unichat/components/forms/Select";
import { Switch } from "unichat/components/forms/Switch";
import { useStorage } from "unichat/hooks/useStorage";
import { useWidgets } from "unichat/hooks/useWidgets";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { settingsService, UniChatSettings, UniChatSettingsKeys } from "unichat/services/settingsService";
import { StorageKeys } from "unichat/services/storageService";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { GeneralSettingsTabStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
}

export function GeneralSettingsTab({ onClose }: Props): PReact.ComponentChildren {
    const [dirty, setDirty] = useState(false);
    const [initialSettings, setInitialSettings] = useState<Partial<UniChatSettings>>({});
    const [widgets, _reloadWidgets] = useWidgets(toWidgetOptionGroup, []);

    const selectRef = useRef<HTMLInputElement>(null);
    const openToLanRef = useRef<HTMLInputElement>(null);

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

        await settingsService.setItems(settingsCopy);
        setInitialSettings(settingsCopy);

        if (beforeOpenToLan !== settingsCopy[UniChatSettingsKeys.OPEN_TO_LAN]) {
            setRequiresRestart(true);
        }
    }

    function dispatchTour(type: EventEmitterEvents["tour:start"]["type"]): void {
        onClose();
        eventEmitter.emit("tour:start", { type });
    }

    useEffect(() => {
        function changeDirty(this: HTMLInputElement): void {
            setDirty(true);
            this.removeEventListener("change", changeDirty);
        }

        async function init(): Promise<void> {
            const settings = await settingsService.getItems([
                UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET,
                UniChatSettingsKeys.OPEN_TO_LAN
            ]);

            if (selectRef.current) {
                selectRef.current.value = settings[UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET] || "default";
                selectRef.current.addEventListener("change", changeDirty);
            }

            if (openToLanRef.current) {
                openToLanRef.current.checked = settings[UniChatSettingsKeys.OPEN_TO_LAN] || false;
                openToLanRef.current.addEventListener("change", changeDirty);
            }

            /* ================================================================================== */

            setInitialSettings(settings);
        }

        init();
    }, []);

    return (
        <GeneralSettingsTabStyledContainer>
            <Select
                inputRef={selectRef}
                label="Default preview widget"
                description="Select the default widget to be used in preview panels"
                options={widgets}
            />

            <hr />

            <div className="openToLan-section">
                <Switch
                    inputRef={openToLanRef}
                    label="Open to LAN"
                    description="Allow other devices on your local network view widgets."
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
                {openToLanRef.current?.checked && (
                    <div className="alert alert-warning">
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

            <div className="tour-section">
                Tour
                <div className="tour-section--buttons">
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

            <div className="general_settings--footer">
                <Button variant="success" disabled={!dirty} onClick={applySettings}>
                    Apply
                </Button>
            </div>
        </GeneralSettingsTabStyledContainer>
    );
}
