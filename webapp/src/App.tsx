/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { createTheme, MantineProvider, Badge, Button, Card, Divider, Menu, Tooltip } from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { marked } from "marked";
import semver from "semver";

import { AboutModal } from "./components/AboutModal";
import { DashboardHome } from "./components/DashboardHome";
import { Gallery } from "./components/Gallery";
import { Plugins } from "./components/Plugins";
import { Tour } from "./components/Tour";
import { WidgetEditor } from "./components/WidgetEditor";
import { AppContext } from "./contexts/AppContext";
import { commandService } from "./services/commandService";
import { eventEmitter } from "./services/eventEmitter";
import { loggerService } from "./services/loggerService";
import { DashboardStyledContainer, ReleaseNotesWrapper } from "./styles/DashboardStyled";

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
    const [hasUpdate, setHasUpdate] = React.useState(false);
    const [hasNewsTour, setHasNewsTour] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState<keyof typeof tabs>("dashboard");

    const { metadata, setShowWidgetPreview, showWidgetPreview } = React.useContext(AppContext);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    function toggleAboutModal(): void {
        modals.open({ title: `About ${metadata.displayName}`, children: <AboutModal /> });
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
            title: "Plugins",
            size: "xl",
            children: <Plugins />
        });
    }

    async function checkForUpdates(): Promise<void> {
        const latestRelease = `${metadata.homepage.replace("https://github.com", "https://api.github.com/repos")}/releases/latest`;
        const response = await fetch(latestRelease, { method: "GET", cache: "no-cache" });
        if (!response.ok) {
            loggerService.error("Failed to fetch latest release information.");

            return;
        }

        const data = await response.json();
        const body = data.body ?? "";
        const latestVersion = data.tag_name;
        if (semver.gt(latestVersion, metadata.version)) {
            const parsedBody = { __html: marked.parse(body) };
            setHasUpdate(true);
            modals.openConfirmModal({
                title: `A new version of ${metadata.displayName} is available!`,
                size: "lg",
                children: (
                    <ReleaseNotesWrapper>
                        <h2>
                            {latestVersion}
                            <Badge variant="outline" size="xs" color="green">
                                Latest
                            </Badge>
                        </h2>
                        <Divider />
                        <div className="release-notes" dangerouslySetInnerHTML={parsedBody} />
                    </ReleaseNotesWrapper>
                ),
                labels: { confirm: "Download Update", cancel: "Close" },
                groupProps: { justify: "center" },
                cancelProps: { display: "none" },
                onConfirm: () => openUrl(data.html_url)
            });
        }
    }

    React.useEffect(() => {
        commandService.tourStepsHasNew().then((hasNew) => setHasNewsTour(hasNew));
        commandService
            .isDev()
            .then(
                (isDev) =>
                    !isDev &&
                    checkForUpdates().catch((err) => loggerService.error("Failed to check for updates: {}", err))
            );
    }, []);

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

                        <Menu position="right">
                            <Menu.Target>
                                <Button variant="default" data-tour="settings">
                                    <i className="fas fa-sliders-h" />
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Sub>
                                    <Menu.Sub.Target>
                                        <Menu.Sub.Item leftSection={<i className="fas fa-compass" />}>
                                            Tour
                                        </Menu.Sub.Item>
                                    </Menu.Sub.Target>
                                    <Menu.Sub.Dropdown>
                                        <Menu.Item
                                            leftSection={<i className="fas fa-map" />}
                                            onClick={() => eventEmitter.emit("tour:start", { type: "full" })}
                                        >
                                            Full tour
                                        </Menu.Item>
                                        {hasNewsTour && (
                                            <Menu.Item
                                                leftSection={<i className="fas fa-sparkles" />}
                                                color="green"
                                                onClick={() => eventEmitter.emit("tour:start", { type: "whats-new" })}
                                            >
                                                What is new?
                                            </Menu.Item>
                                        )}
                                    </Menu.Sub.Dropdown>
                                </Menu.Sub>
                                <Menu.Item
                                    leftSection={<i className="fas fa-sync" />}
                                    color={hasUpdate ? "green" : null}
                                    onClick={checkForUpdates}
                                    data-tour="settings-check-for-updates"
                                >
                                    {hasUpdate ? "A new version is available!" : "Check for updates"}
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<i className="fas fa-info-circle" />}
                                    onClick={toggleAboutModal}
                                    data-tour="settings-about"
                                >
                                    About
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Card>
                    <div className="content">
                        {tabs[selectedTab] && React.createElement(tabs[selectedTab].component)}
                    </div>
                </DashboardStyledContainer>

                <Tour />
            </ModalsProvider>
        </MantineProvider>
    );
}
