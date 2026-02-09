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

import clsx from "clsx";
import Button from "react-bootstrap/Button";

import { ErrorBoundary } from "unichat/components/ErrorBoundary";
import { ModalContext } from "unichat/contexts/ModalContext";

import { AboutSettingsTab } from "./AboutSettingsTab";
import { CheckUpdatesSettingsTab } from "./CheckUpdatesSettingsTab";
import { DevelopersSettingsTab } from "./DevelopersSettingsTab";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { SettingsModalStyledContainer, SettingsSidebarStyledFooter, SettingsSidebarStyledItems } from "./styled";

interface Props {
    children?: React.ReactNode;
}

interface SelectedItemProps {
    onClose(): void;
}

interface SettingsItem {
    title: string;
    icon: string;
    children: React.ComponentType<SelectedItemProps>;
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

export function SettingsModal(_props: Props): React.ReactNode {
    const { sharedStore, setSharedStore, onClose } = React.useContext(ModalContext);

    const TabContent = React.useCallback(
        (props: SelectedItemProps) => {
            const selectedItem = settingsItems[sharedStore.selectedItem];
            if (selectedItem != null) {
                if (sharedStore.modalTitle !== selectedItem.title) {
                    setSharedStore((old) => ({ ...old, modalTitle: selectedItem.title }));
                }

                const Element = selectedItem.children;

                return <Element {...props} />;
            }

            throw new Error("Selected item not found in settingsItems");
        },
        [sharedStore.selectedItem, sharedStore.modalTitle, setSharedStore]
    );

    return (
        <SettingsModalStyledContainer>
            <ErrorBoundary>
                <TabContent onClose={onClose} />
            </ErrorBoundary>
        </SettingsModalStyledContainer>
    );
}

export const SettingsModalLeftSection = (_props: Props): React.ReactNode => {
    const { sharedStore, setSharedStore } = React.useContext(ModalContext);

    function onSelectTab(tabKey: string, tabItem: SettingsItem): void {
        setSharedStore((old) => ({
            ...old,
            selectedItem: tabKey,
            modalTitle: tabItem.title
        }));
    }

    return (
        <>
            <SettingsSidebarStyledItems className="settings-sidebar-items">
                {Object.entries(settingsItems).map(([key, item]) => (
                    <Button
                        key={key}
                        variant={key === sharedStore.selectedItem ? "primary" : "default"}
                        onClick={() => onSelectTab(key, item)}
                    >
                        <i className={clsx(item.icon, "fa-fw")} />
                        {item.title}
                    </Button>
                ))}
            </SettingsSidebarStyledItems>

            <SettingsSidebarStyledFooter className="settings-sidebar-footer">
                <span>
                    <strong>{UNICHAT_DISPLAY_NAME}</strong> {UNICHAT_VERSION}
                </span>
            </SettingsSidebarStyledFooter>
        </>
    );
};
