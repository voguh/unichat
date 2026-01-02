/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Alert, Button, ComboboxData, Divider, Select, Switch, Text } from "@mantine/core";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { eventEmitter, EventEmitterEvents } from "unichat/services/eventEmitter";
import { UniChatSettings } from "unichat/utils/constants";

import { GeneralSettingsTabStyledContainer, OpenToLANSettingWrapper } from "./styled";

interface Props {
    onClose: () => void;
}

export function GeneralSettingsTab({ onClose }: Props): React.ReactNode {
    const [widgets, setWidgets] = React.useState<ComboboxData>([]);
    const [settings, setSettings] = React.useState<Record<string, unknown>>({});

    const { metadata, requiresRestart, setRequiresRestart } = React.useContext(AppContext);

    async function updateSetting<T>(key: string, value: T): Promise<void> {
        const settingsCopy = { ...settings };
        if (settingsCopy[key] == null) {
            throw new Error(`Setting with key "${key}" does not exist.`);
        }

        settingsCopy[key] = value;
        setSettings(settingsCopy);
        await commandService.settingsSetItem(key as UniChatSettings, value);
    }

    function dispatchTour(type: EventEmitterEvents["tour:start"]["type"]): void {
        onClose();
        eventEmitter.emit("tour:start", { type });
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await commandService.listWidgets();
            const sortedWidgets = widgets.map((groupItem) => ({
                group: groupItem.group,
                items: groupItem.items.filter((item) => item !== "example").sort((a, b) => a.localeCompare(b))
            }));
            setWidgets(sortedWidgets);

            const defaultPreviewWidget = await commandService.settingsGetItem(UniChatSettings.DEFAULT_PREVIEW_WIDGET);

            /* ================================================================================== */

            const lanStatus = await commandService.settingsGetItem(UniChatSettings.OPEN_TO_LAN);

            /* ================================================================================== */

            const newSettings = { ...settings };
            newSettings[UniChatSettings.DEFAULT_PREVIEW_WIDGET] = defaultPreviewWidget;
            newSettings[UniChatSettings.OPEN_TO_LAN] = lanStatus;
            setSettings(newSettings);
        }

        init();
    }, []);

    return (
        <GeneralSettingsTabStyledContainer>
            <Select
                label="Default preview widget"
                description="Select the default widget to be used in preview panels"
                data={widgets}
                value={settings[UniChatSettings.DEFAULT_PREVIEW_WIDGET] as string}
                onChange={(value) => updateSetting(UniChatSettings.DEFAULT_PREVIEW_WIDGET, value)}
            />

            <Divider my="md" />

            <OpenToLANSettingWrapper>
                <Switch
                    label="Open to LAN"
                    description="Allow other devices on your local network view widgets."
                    checked={settings[UniChatSettings.OPEN_TO_LAN] as boolean}
                    onChange={(evt) =>
                        updateSetting(UniChatSettings.OPEN_TO_LAN, evt.currentTarget.checked).then(setRequiresRestart)
                    }
                />

                {requiresRestart && (
                    <Alert variant="light" color="blue" icon={<i className="fas fa-info-circle" />}>
                        <span>
                            <strong>{metadata.displayName}</strong> must be restarted for this setting to take effect.
                        </span>
                    </Alert>
                )}
                {(settings[UniChatSettings.OPEN_TO_LAN] as boolean) && (
                    <Alert variant="light" color="yellow" icon={<i className="fas fa-info-circle" />}>
                        <span>
                            Make sure your firewall allows incoming connections on port <strong>9527</strong>.
                        </span>
                    </Alert>
                )}
            </OpenToLANSettingWrapper>

            <Divider my="md" />
            <div className="tour-section">
                <Text size="sm">Tour</Text>
                <Button.Group>
                    <Button
                        variant="default"
                        leftSection={<i className="fas fa-compass" />}
                        onClick={() => dispatchTour("full")}
                    >
                        View Tour
                    </Button>
                    <Button
                        variant="default"
                        leftSection={<i className="fas fa-map" />}
                        onClick={() => dispatchTour("whats-new")}
                    >
                        What&apos;s New?
                    </Button>
                </Button.Group>
            </div>
        </GeneralSettingsTabStyledContainer>
    );
}
