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

import { Button } from "@mantine/core";
import clsx from "clsx";

import { AboutSettingsTab } from "./AboutSettingsTab";
import { CheckUpdatesSettingsTab } from "./CheckUpdatesSettingsTab";
import { DevelopersSettingsTab } from "./DevelopersSettingsTab";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { SettingsStyledContainer } from "./styled";

interface Props {
    onClose: () => void;
    startupTab?: string | null;
}

interface SettingsItem {
    title: string;
    icon: string;
    children: React.ComponentType<{ onClose: () => void }>;
}

const settingsItems: Record<string, SettingsItem> = {
    general: {
        title: "General",
        icon: "fas fa-cog",
        children: GeneralSettingsTab
    },
    developers: {
        title: "Developers",
        icon: "fas fa-code",
        children: DevelopersSettingsTab
    },
    "check-updates": {
        title: "Check for Updates",
        icon: "fas fa-download",
        children: CheckUpdatesSettingsTab
    },
    about: {
        title: "About",
        icon: "fas fa-info-circle",
        children: AboutSettingsTab
    }
};

export function SettingsModal({ onClose, startupTab }: Props): React.ReactNode {
    const [selectedItem, setSelectedItem] = React.useState(startupTab || "general");

    return (
        <SettingsStyledContainer>
            <div className="settings-sidebar">
                <div className="settings-sidebar-header">Settings</div>
                <div className="settings-sidebar-items">
                    {Object.entries(settingsItems).map(([key, item]) => (
                        <Button
                            key={key}
                            fullWidth
                            variant={key === selectedItem ? "filled" : "default"}
                            color="blue"
                            onClick={() => setSelectedItem(key)}
                            leftSection={<i className={clsx(item.icon, "fa-fw")} />}
                        >
                            {item.title}
                        </Button>
                    ))}
                </div>

                <div className="settings-sidebar-footer">
                    <span>
                        <strong>{UNICHAT_DISPLAY_NAME}</strong> {UNICHAT_VERSION}
                    </span>
                </div>
            </div>
            {settingsItems[selectedItem] && (
                <div className="settings-content">
                    <div className="settings-content-header">
                        <div className="settings-content-header--title">
                            <span>{settingsItems[selectedItem].title}</span>
                        </div>
                        <div className="settings-content-header--actions">
                            <Button variant="default" onClick={onClose}>
                                <i className="fas fa-times" />
                            </Button>
                        </div>
                    </div>
                    <div className="settings-content-body">
                        {React.createElement(settingsItems[selectedItem].children, { onClose })}
                    </div>
                </div>
            )}
        </SettingsStyledContainer>
    );
}
