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

import { Button } from "unichat/components/Button";
import { ErrorBoundary } from "unichat/components/ErrorBoundary";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { ModalContext } from "unichat/contexts/ModalContext";
import { usePlugins } from "unichat/hooks/usePlugins";

import { AboutSettingsTab } from "./AboutSettingsTab";
import { CheckUpdatesSettingsTab } from "./CheckUpdatesSettingsTab";
import { DevelopersSettingsTab } from "./DevelopersSettingsTab";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { PluginSettingsTab } from "./PluginSettingsTab";
import { SettingsSidebarStyledFooter, SettingsSidebarStyledItems } from "./styled";

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

function capitalizePluginName(pluginName: string): string {
    if (pluginName.startsWith("plugin-")) {
        pluginName = pluginName.substring(7);
    }

    return (pluginName.charAt(0).toUpperCase() + pluginName.slice(1)).replace(/[-_]/g, " ");
}

function TabContent({ selectedItem, ...rest }: { selectedItem: string } & SelectedItemProps): React.ReactNode {
    if (!(selectedItem in settingsItems)) {
        throw new Error("Selected item not found in settingsItems");
    }

    const Element = settingsItems[selectedItem].children;

    return <Element {...rest} />;
}

export function SettingsModal(_props: Props): React.ReactNode {
    const { sharedStore, setSharedStore, onClose } = React.useContext(ModalContext);

    React.useEffect(() => {
        if (sharedStore.selectedItem.startsWith("plugin:")) {
            const pluginName = sharedStore.selectedItem.substring(7);
            setSharedStore((old) => ({ ...old, modalTitle: capitalizePluginName(pluginName) }));
        } else {
            const selectedItem = settingsItems[sharedStore.selectedItem];
            if (selectedItem != null) {
                setSharedStore((old) => ({ ...old, modalActions: undefined, modalTitle: selectedItem.title }));
            }
        }
    }, [sharedStore.selectedItem]);

    if ((sharedStore.selectedItem || "general").startsWith("plugin:")) {
        const pluginName = sharedStore.selectedItem.substring(7);

        return (
            <ErrorBoundary>
                <PluginSettingsTab onClose={onClose} pluginName={pluginName} />
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <TabContent selectedItem={sharedStore.selectedItem} onClose={onClose} />
        </ErrorBoundary>
    );
}

export const SettingsModalLeftSection = (_props: Props): React.ReactNode => {
    const { sharedStore, setSharedStore } = React.useContext(ModalContext);

    const [plugins, _refreshPlugins] = usePlugins((plugins) => plugins, []);

    return (
        <>
            <SettingsSidebarStyledItems className="settings-sidebar-items">
                {Object.entries(settingsItems).map(([key, item]) => (
                    <Button
                        key={key}
                        variant={key === sharedStore.selectedItem ? "filled" : "default"}
                        onClick={() => setSharedStore((old) => ({ ...old, selectedItem: key }))}
                    >
                        <i className={clsx(item.icon, "fa-fw")} />
                        <span>{item.title}</span>
                    </Button>
                ))}

                <div className="divider">
                    <hr />
                    <div>PLUGINS</div>
                </div>

                {plugins
                    .filter((plugin) => plugin.hasCustomSettings)
                    .map((plugin) => (
                        <Tooltip key={plugin.name} placement="right" content={plugin.name}>
                            <Button
                                variant={`plugin:${plugin.name}` === sharedStore.selectedItem ? "filled" : "default"}
                                onClick={() =>
                                    setSharedStore((old) => ({ ...old, selectedItem: `plugin:${plugin.name}` }))
                                }
                            >
                                <i className="fas fa-puzzle-piece fa-fw" />
                                <span>{capitalizePluginName(plugin.name)}</span>
                            </Button>
                        </Tooltip>
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
