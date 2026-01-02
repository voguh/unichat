/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { createTheme, MantineProvider, Button, Card, Tooltip, Modal } from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { notifications, Notifications } from "@mantine/notifications";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import semver from "semver";

import { DashboardHome } from "./components/DashboardHome";
import { Gallery } from "./components/Gallery";
import { Plugins, PluginsHeader } from "./components/Plugins";
import { SettingsModal } from "./components/SettingsModal";
import { Tour } from "./components/Tour";
import { WidgetEditor } from "./components/WidgetEditor";
import { AppContext } from "./contexts/AppContext";
import { commandService } from "./services/commandService";
import { DashboardStyledContainer } from "./styles/DashboardStyled";
import { UniChatSettings } from "./utils/constants";

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

    const { metadata, releases, setShowWidgetPreview, showWidgetPreview } = React.useContext(AppContext);

    const isMounted = React.useRef(false);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    function toggleGallery(): void {
        modals.open({
            title: "Gallery",
            size: "xl",
            children: <Gallery />
        });
    }

    function togglePluginsModal(): void {
        modals.open({
            title: <PluginsHeader />,
            size: "xl",
            children: <Plugins />
        });
    }

    async function init(): Promise<void> {
        const isOpenToLan = await commandService.settingsGetItem(UniChatSettings.OPEN_TO_LAN);

        if (isOpenToLan) {
            notifications.show({
                title: `${metadata.displayName} is open to LAN`,
                message: "Your widgets are accessible by other devices on the same local network.",
                color: "yellow"
            });
        }

        /* ====================================================================================== */

        const currentVersion = metadata.version;
        const latestRelease = releases.find((release) => !release.prerelease);

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
    });

    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <ModalsProvider modalProps={{ centered: true }}>
                <Notifications position="bottom-center" />

                <DashboardStyledContainer>
                    <Card className="sidebar" withBorder shadow="xs">
                        <div>
                            <Tooltip label="Dashboard" position="right" withArrow>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedTab("dashboard")}
                                    variant={selectedTab === "dashboard" ? "filled" : "default"}
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
                                    onClick={() => revealItemInDir(metadata.widgetsDir)}
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
