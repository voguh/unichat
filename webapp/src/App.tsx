/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import * as eventService from "@tauri-apps/api/event";
import Card from "react-bootstrap/Card";

import { PluginsModal, PluginsModalActions } from "unichat/__internal__/PluginsModal";
import { SettingsModalLeftSection, SettingsModal } from "unichat/__internal__/SettingsModal";
import { Button } from "unichat/components/Button";
import { ErrorBoundary } from "unichat/components/ErrorBoundary";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { settingsService, UniChatSettingsKeys } from "unichat/services/settingsService";
import { Dashboard, DashboardLeftSection } from "unichat/tabs/Dashboard";
import { WidgetEditor, WidgetEditorLeftSection } from "unichat/tabs/WidgetEditor";
import { IPCNotificationEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { Tour } from "./__internal__/Tour";
import { commandService } from "./services/commandService";

interface TabOptions {
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    leftSection: React.ReactNode;
}

const tabs: Record<string, TabOptions> = {
    dashboard: {
        label: "Dashboard",
        icon: <i className="fas fa-th-large" />,
        component: <Dashboard />,
        leftSection: <DashboardLeftSection />
    },
    widgetEditor: {
        label: "Widget Editor",
        icon: <i className="fas fa-pencil-ruler" />,
        component: <WidgetEditor />,
        leftSection: <WidgetEditorLeftSection />
    }
};

function TabLeftSection({ selectedTab }: { selectedTab: keyof typeof tabs }): React.ReactNode {
    const leftSection = tabs[selectedTab]?.leftSection;
    if (leftSection == null) {
        return null;
    }

    return (
        <>
            <div className="divider" />
            {leftSection}
        </>
    );
}

function TabContent({ selectedTab }: { selectedTab: keyof typeof tabs }): React.ReactNode {
    const content = tabs[selectedTab]?.component;
    if (content == null) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className="divider" />
            {content}
        </ErrorBoundary>
    );
}

const _logger = LoggerFactory.getLogger("App");
export function App(): JSX.Element {
    const [selectedTab, setSelectedTab] = React.useState<keyof typeof tabs>("dashboard");

    function togglePluginsModal(): void {
        modalService.openModal({
            size: "xl",
            title: "Plugins",
            actions: <PluginsModalActions />,
            children: <PluginsModal />
        });
    }

    function toggleSettingsModal(tab?: string | null): void {
        modalService.openModal({
            size: "xl",
            title: "Settings",
            leftSectionTitle: "Settings",
            leftSection: <SettingsModalLeftSection />,
            children: <SettingsModal />,
            sharedStoreInitialState: {
                selectedItem: Strings.isNullOrEmpty(tab) ? "general" : tab
            }
        });
    }

    /* ========================================================================================== */

    async function init(): Promise<void> {
        const isOpenToLan = await settingsService.getItem(UniChatSettingsKeys.OPEN_TO_LAN);
        if (isOpenToLan) {
            notificationService.warn({
                title: `${UNICHAT_DISPLAY_NAME} is open to LAN`,
                message: "Your widgets are accessible by other devices on the same local network."
            });
        }

        /* ====================================================================================== */

        const releaseInfo = await commandService.getReleases();
        if (releaseInfo.hasUpdate) {
            toggleSettingsModal("check-updates");
        }
    }

    React.useEffect(() => {
        init();

        /* ====================================================================================== */

        const unListenerPromise = eventService.listen<IPCNotificationEvent>("unichat://notification", ({ payload }) => {
            const title = payload.title || "Notification";
            const message = payload.message || "";
            if (!Strings.isNullOrEmpty(message)) {
                notificationService.info({ title, message });
            }
        });

        return () => {
            if (unListenerPromise) {
                unListenerPromise.then((unlisten) => unlisten());
            }
        };
    }, []);

    return (
        <>
            <Card className="sidebar">
                <div>
                    {Object.entries(tabs).map(([key, tab]) => (
                        <Tooltip key={key} content={tab.label} placement="right">
                            <Button
                                data-tour={`tab-${key}-toggle`}
                                variant={selectedTab === key ? "filled" : "default"}
                                color={selectedTab === key ? "green" : "blue"}
                                onClick={() => setSelectedTab(key)}
                            >
                                {tab.icon}
                            </Button>
                        </Tooltip>
                    ))}

                    <TabLeftSection selectedTab={selectedTab} />
                </div>

                <Tooltip content="Plugins" placement="right">
                    <Button variant="default" onClick={togglePluginsModal} data-tour="plugins-modal-toggle">
                        <i className="fas fa-cubes" />
                    </Button>
                </Tooltip>

                <Tooltip content="Settings" placement="right">
                    <Button variant="default" onClick={() => toggleSettingsModal()} data-tour="settings-modal-toggle">
                        <i className="fas fa-sliders-h" />
                    </Button>
                </Tooltip>
            </Card>

            <div className="content">
                <TabContent selectedTab={selectedTab} />
            </div>

            <Tour />
        </>
    );
}
