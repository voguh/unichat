/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/
import React from "react";

import { Badge, Button, Card, Divider, Menu, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAdjustments, IconEraser, IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { openUrl } from "@tauri-apps/plugin-opener";
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
            console.error("Failed to fetch latest release information.");

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
                        <Button size="sm" onClick={handleClearChat}>
                            <IconEraser size="20" />
                        </Button>
                    </Tooltip>
                </div>

                <Menu position="right">
                    <Menu.Target>
                        <Button variant="default">
                            <IconAdjustments size="20" />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconRefresh size="14" />}
                            color={hasUpdate ? "green" : null}
                            onClick={checkForUpdates}
                        >
                            {hasUpdate ? "A new version is available!" : "Check for updates"}
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconInfoCircle size="14" />} onClick={toggleAboutModal}>
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
