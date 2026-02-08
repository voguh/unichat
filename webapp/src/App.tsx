/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { createTheme, MantineProvider, Button, Card, Tooltip, Modal } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { notifications, Notifications } from "@mantine/notifications";
import * as eventService from "@tauri-apps/api/event";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import semver from "semver";

import { DashboardHome } from "./components/DashboardHome";
import { Gallery, GalleryActions } from "./components/Gallery";
import { ModalWrapper } from "./components/ModalWrapper";
import { Plugins, PluginsActions } from "./components/Plugins";
import { SettingsModal } from "./components/SettingsModal";
import { Tour } from "./components/Tour";
import { WidgetEditor } from "./components/WidgetEditor";
import { AppContext } from "./contexts/AppContext";
import { commandService } from "./services/commandService";
import { modalService } from "./services/modalService";
import { DashboardStyledContainer } from "./styles/DashboardStyled";
import { UniChatSettings } from "./utils/constants";
import { IPCNotificationEvent } from "./utils/IPCStatusEvent";
import { Strings } from "./utils/Strings";

const theme = createTheme({
    fontFamily: "Roboto, sans-serif",
    fontFamilyMonospace: "Roboto Mono, monospace"
});

const tabs = {
    dashboard: {
        label: "Dashboard",
        component: DashboardHome
    },
    widgetEditor: {
        label: "Widget Editor",
        component: WidgetEditor
    }
};

export default function App(): JSX.Element {
    const [selectedTab, setSelectedTab] = React.useState<keyof typeof tabs>("dashboard");
    const [settingsModalOpen, setSettingsModalOpen] = React.useState<boolean | string>(false);

    const { setShowWidgetPreview, showWidgetPreview } = React.useContext(AppContext);

    const isMounted = React.useRef(false);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    function toggleGallery(): void {
        modalService.openModal({
            size: "xl",
            title: "Gallery",
            actions: <GalleryActions />,
            children: <Gallery />
        });
    }

    function togglePluginsModal(): void {
        modalService.openModal({
            size: "xl",
            title: "Plugins",
            actions: <PluginsActions />,
            children: <Plugins />
        });
    }

    async function init(): Promise<void> {
        UNICHAT_RELEASES.sort((a, b) => semver.rcompare(a.name, b.name));

        const isOpenToLan = await commandService.settingsGetItem(UniChatSettings.OPEN_TO_LAN);

        if (isOpenToLan) {
            notifications.show({
                title: `${UNICHAT_DISPLAY_NAME} is open to LAN`,
                message: "Your widgets are accessible by other devices on the same local network.",
                color: "yellow"
            });
        }

        /* ====================================================================================== */

        const currentVersion = UNICHAT_VERSION;
        const latestRelease = UNICHAT_RELEASES.find((release) => !release.prerelease);

        if (latestRelease && semver.gt(latestRelease.name, currentVersion)) {
            setSettingsModalOpen("check-updates");
        }
    }

    React.useEffect(() => {
        if (isMounted.current) {
            return;
        }

        isMounted.current = true;
        init();

        eventService.listen<IPCNotificationEvent>("unichat://notification", ({ payload }) => {
            const title = payload.title || "Notification";
            const message = payload.message || "";
            if (!Strings.isNullOrEmpty(message)) {
                notifications.show({ message, title });
            }
        });
    }, []);

    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <ModalsProvider modals={{ unichat: ModalWrapper }}>
                <Notifications position="bottom-center" />

                <DashboardStyledContainer>
                    <Card className="sidebar" withBorder shadow="xs">
                        <div>
                            <Tooltip label="Dashboard" position="right" withArrow>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedTab("dashboard")}
                                    variant={selectedTab === "dashboard" ? "filled" : "default"}
                                    data-tour="dashboard"
                                    color="green"
                                >
                                    <i className="fas fa-th-large" />
                                </Button>
                            </Tooltip>
                            <Tooltip label="Widget Editor" position="right" withArrow>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedTab("widgetEditor")}
                                    variant={selectedTab === "widgetEditor" ? "filled" : "default"}
                                    data-tour="widget-editor"
                                    color="green"
                                >
                                    <i className="fas fa-pencil-ruler" />
                                </Button>
                            </Tooltip>

                            <div className="divider" />

                            {selectedTab === "dashboard" && (
                                <Tooltip label="Clear chat history" position="right" withArrow>
                                    <Button size="sm" onClick={handleClearChat} data-tour="clear-chat">
                                        <i className="fas fa-eraser" />
                                    </Button>
                                </Tooltip>
                            )}
                            <Tooltip label="Open user widgets folder" position="right" withArrow>
                                <Button
                                    onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}
                                    data-tour="user-widgets-directory"
                                >
                                    <i className="fas fa-folder" />
                                </Button>
                            </Tooltip>
                            {selectedTab === "dashboard" && (
                                <Tooltip label="Toggle widget preview" position="right" withArrow>
                                    <Button
                                        onClick={() => setShowWidgetPreview((old) => !old)}
                                        variant={showWidgetPreview ? "filled" : "default"}
                                        data-tour="toggle-widget-preview"
                                    >
                                        {showWidgetPreview ? (
                                            <i className="fas fa-window-maximize" />
                                        ) : (
                                            <i className="far fa-window-maximize" />
                                        )}
                                    </Button>
                                </Tooltip>
                            )}
                            {selectedTab === "widgetEditor" && (
                                <Tooltip label="Gallery" position="right" withArrow>
                                    <Button onClick={toggleGallery} data-tour="gallery-toggle">
                                        <i className="fas fa-images" />
                                    </Button>
                                </Tooltip>
                            )}
                        </div>

                        <Tooltip label="Plugins" position="right" withArrow>
                            <Button variant="default" onClick={togglePluginsModal} data-tour="plugins-modal-toggle">
                                <i className="fas fa-cubes" />
                            </Button>
                        </Tooltip>

                        <Tooltip label="Settings" position="right" withArrow>
                            <Button
                                variant="default"
                                onClick={() => setSettingsModalOpen(true)}
                                data-tour="settings-modal-toggle"
                            >
                                <i className="fas fa-sliders-h" />
                            </Button>
                        </Tooltip>
                    </Card>
                    <div className="content">
                        {tabs[selectedTab] && React.createElement(tabs[selectedTab].component)}
                    </div>
                </DashboardStyledContainer>

                <Tour />
                <Modal
                    opened={settingsModalOpen != null && settingsModalOpen !== false}
                    size="100%"
                    withCloseButton={false}
                    onClose={() => setSettingsModalOpen(false)}
                >
                    <SettingsModal
                        onClose={() => setSettingsModalOpen(false)}
                        startupTab={typeof settingsModalOpen === "string" ? settingsModalOpen : null}
                    />
                </Modal>
            </ModalsProvider>
        </MantineProvider>
    );
}
