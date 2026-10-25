/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import * as eventService from "@tauri-apps/api/event";

import { Button } from "@voguh/unichat-ui/Button";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import { ModalProvider } from "unichat/__internal__/ModalProvider";
import { NotificationProvider } from "unichat/__internal__/NotificationProvider";
import { PluginsModal, PluginsModalActions } from "unichat/__internal__/PluginsModal";
import { SettingsModal } from "unichat/__internal__/SettingsModal";
import { Tour } from "unichat/__internal__/Tour";
import { WidgetsModal, WidgetsModalActions, WidgetsModalTitle } from "unichat/__internal__/WidgetsModal";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { settingsService, UniChatSettingsKeys } from "unichat/services/settingsService";
import { StorageKeys, storageService } from "unichat/services/storageService";
import { Dashboard, DashboardLeftSection } from "unichat/tabs/Dashboard";
import { WidgetEditor, WidgetEditorLeftSection } from "unichat/tabs/WidgetEditor";
import type { IPCNotificationEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

interface TabOptions {
    label: string;
    icon: PReact.ComponentChildren;
    component: PReact.ComponentChildren;
    leftSection: PReact.ComponentChildren;
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

function TabLeftSection({ selectedTab }: { selectedTab: keyof typeof tabs }): PReact.ComponentChildren {
    const leftSection = tabs[selectedTab]?.leftSection;
    if (leftSection == null) {
        return null;
    }

    return (
        <div className="sidebar__left-section">
            <div className="sidebar__divider" />
            {leftSection}
        </div>
    );
}

function TabContent({ selectedTab }: { selectedTab: keyof typeof tabs }): PReact.ComponentChildren {
    const content = tabs[selectedTab]?.component;
    if (content == null) {
        return null;
    }

    return content;
}

const _logger = LoggerFactory.getLogger("App");
export function App(): PReact.ComponentChildren {
    const [openedSettingsModal, setOpenedSettingsModal] = useState<string | boolean>(false);
    const [selectedTab, setSelectedTab] = useState<keyof typeof tabs>("dashboard");

    function togglePluginsModal(): void {
        modalService.openModal({
            size: "xl",
            title: "Plugins",
            actions: <PluginsModalActions />,
            children: <PluginsModal />
        });
    }

    function toggleWidgetsModal(): void {
        modalService.openModal({
            size: "xl",
            title: <WidgetsModalTitle />,
            actions: <WidgetsModalActions />,
            children: <WidgetsModal />
        });
    }

    /* ========================================================================================== */

    useEffect(() => {
        async function init(): Promise<void> {
            storageService.set(StorageKeys.REQUIRES_RESTART, false);

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
                setOpenedSettingsModal("check-updates");
            }
        }

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
            <div className="sidebar">
                <div className="sidebar__tabs">
                    {Object.entries(tabs).map(([key, tab]) => (
                        <Tooltip key={key} placement="right" content={tab.label}>
                            <Button
                                data-tour={`tab-${key}-toggle`}
                                variant={selectedTab === key ? "primary" : undefined}
                                onClick={() => setSelectedTab(key)}
                            >
                                {tab.icon}
                            </Button>
                        </Tooltip>
                    ))}

                    <TabLeftSection selectedTab={selectedTab} />
                </div>

                <div className="sidebar__footer">
                    <Tooltip placement="right" content="Widgets">
                        <Button onClick={toggleWidgetsModal} data-tour="widgets-modal-toggle">
                            <i className="fas fa-object-group" />
                        </Button>
                    </Tooltip>

                    <Tooltip placement="right" content="Plugins">
                        <Button onClick={togglePluginsModal} data-tour="plugins-modal-toggle">
                            <i className="fas fa-cubes" />
                        </Button>
                    </Tooltip>

                    <Tooltip placement="right" content="Settings">
                        <Button onClick={() => setOpenedSettingsModal(true)} data-tour="settings-modal-toggle">
                            <i className="fas fa-sliders-h" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className="content">
                <TabContent selectedTab={selectedTab} />
            </div>

            <SettingsModal
                externalActiveTab={typeof openedSettingsModal === "string" ? openedSettingsModal : null}
                show={!!openedSettingsModal}
                onHide={() => setOpenedSettingsModal(false)}
            />

            <Tour />
            <ModalProvider />
            <NotificationProvider />
        </>
    );
}
