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

import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

import { GroupBase, Option, Select } from "unichat/components/forms/Select";
import { Switch } from "unichat/components/forms/Switch";
import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { settingsService, UniChatSettings, UniChatSettingsKeys } from "unichat/services/settingsService";

import { GeneralSettingsTabStyledContainer, OpenToLANSettingWrapper } from "./styled";

interface Props {
    onClose: () => void;
}

export function GeneralSettingsTab({ onClose }: Props): React.ReactNode {
    const [widgets, setWidgets] = React.useState<GroupBase<Option>[]>([]);
    const [settings, setSettings] = React.useState({} as UniChatSettings);

    const { requiresRestart, setRequiresRestart } = React.useContext(AppContext);

    async function updateSetting<K extends keyof UniChatSettings>(key: K, value: UniChatSettings[K]): Promise<void> {
        const settingsCopy = { ...settings };
        if (settingsCopy[key] == null) {
            throw new Error(`Setting with key "${key}" does not exist.`);
        }

        settingsCopy[key] = value;
        setSettings(settingsCopy);
        await settingsService.setItem(key, value);

        if (key === UniChatSettingsKeys.OPEN_TO_LAN) {
            setRequiresRestart();
        }
    }

    function dispatchTour(type: EventEmitterEvents["tour:start"]["type"]): void {
        onClose();
        eventEmitter.emit("tour:start", { type });
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await commandService.listWidgets();
            const sortedWidgets = widgets.map((groupItem) => ({
                label: groupItem.group,
                options: groupItem.items
                    .filter((item) => item !== "example")
                    .sort((a, b) => a.localeCompare(b))
                    .map((item) => ({ value: item, label: item }))
            }));
            setWidgets(sortedWidgets);

            const defaultPreviewWidget = await settingsService.getItem(UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET);

            /* ================================================================================== */

            const lanStatus = await settingsService.getItem(UniChatSettingsKeys.OPEN_TO_LAN);

            /* ================================================================================== */

            const newSettings = { ...settings };
            newSettings[UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET] = defaultPreviewWidget;
            newSettings[UniChatSettingsKeys.OPEN_TO_LAN] = lanStatus;
            setSettings(newSettings);
        }

        init();
    }, []);

    return (
        <GeneralSettingsTabStyledContainer>
            <Select
                label="Default preview widget"
                description="Select the default widget to be used in preview panels"
                options={widgets}
                value={widgets
                    .flatMap((group) => group.options)
                    .find((option) => option.value === settings[UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET])}
                onChange={(option) => updateSetting(UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET, option!.value)}
            />

            <hr />

            <OpenToLANSettingWrapper>
                <Switch
                    label="Open to LAN"
                    description="Allow other devices on your local network view widgets."
                    checked={settings[UniChatSettingsKeys.OPEN_TO_LAN] || false}
                    onChange={(evt) => updateSetting(UniChatSettingsKeys.OPEN_TO_LAN, evt.currentTarget.checked)}
                />

                {requiresRestart && (
                    <Alert variant="primary">
                        <div>
                            <i className="fas fa-info-circle" />
                        </div>
                        <span>
                            <strong>{UNICHAT_DISPLAY_NAME}</strong> must be restarted for this setting to take effect.
                        </span>
                    </Alert>
                )}
                {settings[UniChatSettingsKeys.OPEN_TO_LAN] && (
                    <Alert variant="warning">
                        <div>
                            <i className="fas fa-info-circle" />
                        </div>
                        <span>
                            Make sure your firewall allows incoming connections on port <strong>9527</strong>.
                        </span>
                    </Alert>
                )}
            </OpenToLANSettingWrapper>

            <hr />

            <div className="tour-section">
                Tour
                <ButtonGroup>
                    <Button variant="default" onClick={() => dispatchTour("full")}>
                        <i className="fas fa-compass" />
                        View Tour
                    </Button>
                    <Button variant="default" onClick={() => dispatchTour("whats-new")}>
                        <i className="fas fa-map" />
                        What&apos;s New?
                    </Button>
                </ButtonGroup>
            </div>
        </GeneralSettingsTabStyledContainer>
    );
}
