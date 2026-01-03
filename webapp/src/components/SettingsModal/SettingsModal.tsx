/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button } from "@mantine/core";
import clsx from "clsx";

import { AppContext } from "unichat/contexts/AppContext";

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

export const settingsItems: Record<string, SettingsItem> = {
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

    const { metadata } = React.useContext(AppContext);

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
                        <strong>{metadata.displayName}</strong> {metadata.version}
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
                    <div className="settings-content-body"></div>
                </div>
            )}
        </SettingsStyledContainer>
    );
}
