/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/
import React from "react";

import { Badge, Button, Card, Divider, Menu, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAdjustments, IconEraser, IconFolder, IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { marked } from "marked";
import semver from "semver";

import { AboutModal } from "unichat/components/AboutModal";
import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";

import { DashboardHome } from "./DashboardHome";
import { DashboardStyledContainer, ReleaseNotesWrapper } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function Dashboard(_props: Props): React.ReactNode {
    const [hasUpdate, setHasUpdate] = React.useState(false);
    const { metadata } = React.useContext(AppContext);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    async function toggleAboutModal(): Promise<void> {
        modals.open({ title: `About ${metadata.displayName}`, children: <AboutModal />, centered: true });
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
        checkForUpdates().catch((err) => loggerService.error("Failed to check for updates: {}", err));
    }, []);

    return (
        <DashboardStyledContainer>
            <Card className="sidebar" withBorder shadow="xs">
                <div>
                    <Tooltip label="Clear chat history" position="right" withArrow>
                        <Button size="sm" onClick={handleClearChat} data-tour="clear-chat">
                            <IconEraser size="20" />
                        </Button>
                    </Tooltip>
                    <Tooltip label="Open user widgets folder" position="right" withArrow>
                        <Button onClick={() => revealItemInDir(metadata.widgetsDir)} data-tour="user-widgets-directory">
                            <IconFolder size="20" />
                        </Button>
                    </Tooltip>
                </div>

                <Menu position="right">
                    <Menu.Target>
                        <Button variant="default" data-tour="settings">
                            <IconAdjustments size="20" />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconRefresh size="14" />}
                            color={hasUpdate ? "green" : null}
                            onClick={checkForUpdates}
                            data-tour="settings-check-for-updates"
                        >
                            {hasUpdate ? "A new version is available!" : "Check for updates"}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconInfoCircle size="14" />}
                            onClick={toggleAboutModal}
                            data-tour="settings-about"
                        >
                            About
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Card>
            <div className="content">
                <DashboardHome />
            </div>
        </DashboardStyledContainer>
    );
}
