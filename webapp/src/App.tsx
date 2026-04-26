/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import PReact from "preact";
import { useEffect, useState } from "preact/hooks";

// import * as eventService from "@tauri-apps/api/event";
// import Card from "react-bootstrap/Card";

// import { PluginsModal, PluginsModalActions } from "unichat/__internal__/PluginsModal";
// import { SettingsModalLeftSection, SettingsModal } from "unichat/__internal__/SettingsModal";
import { Button } from "unichat/components/Button";
// import { ErrorBoundary } from "unichat/components/ErrorBoundary";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { GlobalStyle } from "./styles/GlobalStyles";
import { DashboardLeftSection } from "./tabs/Dashboard";
// import { modalService } from "unichat/services/modalService";
// import { notificationService } from "unichat/services/notificationService";
// import { settingsService, UniChatSettingsKeys } from "unichat/services/settingsService";
// import { Dashboard, DashboardLeftSection } from "unichat/tabs/Dashboard";
// import { WidgetEditor, WidgetEditorLeftSection } from "unichat/tabs/WidgetEditor";
// import { IPCNotificationEvent } from "unichat/utils/IPCStatusEvent";
// import { Strings } from "unichat/utils/Strings";

// import { Tour } from "./__internal__/Tour";
// import { WidgetsModal, WidgetsModalActions } from "./__internal__/WidgetsModal";
// import { commandService } from "./services/commandService";

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
        component: <>batata</>,
        leftSection: <DashboardLeftSection />
    },
    widgetEditor: {
        label: "Widget Editor",
        icon: <i className="fas fa-pencil-ruler" />,
        component: <>widget editor</>,
        leftSection: <>widget editor left section</>
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

// function TabContent({ selectedTab }: { selectedTab: keyof typeof tabs }): React.ReactNode {
//     const content = tabs[selectedTab]?.component;
//     if (content == null) {
//         return null;
//     }

//     return (
//         <ErrorBoundary>
//             <div className="divider" />
//             {content}
//         </ErrorBoundary>
//     );
// }

const _logger = LoggerFactory.getLogger("App");
export function App(): PReact.ComponentChildren {
    const [selectedTab, setSelectedTab] = useState<keyof typeof tabs>("dashboard");

    function togglePluginsModal(): void {
        //     modalService.openModal({
        //         size: "xl",
        //         title: "Plugins",
        //         actions: <PluginsModalActions />,
        //         children: <PluginsModal />
        //     });
    }

    function toggleWidgetsModal(): void {
        //     modalService.openModal({
        //         size: "xl",
        //         title: "Widgets",
        //         actions: <WidgetsModalActions />,
        //         children: <WidgetsModal />
        //     });
    }

    function toggleSettingsModal(tab?: string | null): void {
        //     modalService.openModal({
        //         size: "xl",
        //         title: "Settings",
        //         leftSectionTitle: "Settings",
        //         leftSection: <SettingsModalLeftSection />,
        //         children: <SettingsModal />,
        //         sharedStoreInitialState: {
        //             selectedItem: Strings.isNullOrEmpty(tab) ? "general" : tab
        //         }
        //     });
    }

    /* ========================================================================================== */

    async function init(): Promise<void> {
        //     const isOpenToLan = await settingsService.getItem(UniChatSettingsKeys.OPEN_TO_LAN);
        //     if (isOpenToLan) {
        //         notificationService.warn({
        //             title: `${UNICHAT_DISPLAY_NAME} is open to LAN`,
        //             message: "Your widgets are accessible by other devices on the same local network."
        //         });
        //     }
        //     /* ====================================================================================== */
        //     const releaseInfo = await commandService.getReleases();
        //     if (releaseInfo.hasUpdate) {
        //         toggleSettingsModal("check-updates");
        //     }
    }

    useEffect(() => {
        init();

        //     /* ====================================================================================== */

        //     const unListenerPromise = eventService.listen<IPCNotificationEvent>("unichat://notification", ({ payload }) => {
        //         const title = payload.title || "Notification";
        //         const message = payload.message || "";
        //         if (!Strings.isNullOrEmpty(message)) {
        //             notificationService.info({ title, message });
        //         }
        //     });

        //     return () => {
        //         if (unListenerPromise) {
        //             unListenerPromise.then((unlisten) => unlisten());
        //         }
        //     };
    }, []);

    return (
        <>
            <GlobalStyle />
            <div className="sidebar">
                <div className="sidebar__tabs">
                    {Object.entries(tabs).map(([key, tab]) => (
                        <Tooltip key={key} content={tab.label} placement="right">
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
                    <Tooltip content="Widgets" placement="right">
                        <Button onClick={toggleWidgetsModal} data-tour="widgets-modal-toggle">
                            <i className="fas fa-object-group" />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Plugins" placement="right">
                        <Button onClick={togglePluginsModal} data-tour="plugins-modal-toggle">
                            <i className="fas fa-cubes" />
                        </Button>
                    </Tooltip>

                    <Tooltip content="Settings" placement="right">
                        <Button onClick={() => toggleSettingsModal()} data-tour="settings-modal-toggle">
                            <i className="fas fa-sliders-h" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className="content">{/* <TabContent selectedTab={selectedTab} /> */}</div>

            {/* <Tour /> */}
        </>
    );
}
