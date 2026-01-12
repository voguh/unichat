/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";

import { PluginOverview, PluginOverviewActions } from "./PluginOverview";
import { PluginsGridContainer, PluginsStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger(import.meta.url);
export function Plugins(_props: Props): React.ReactNode {
    const [plugins, setPlugins] = React.useState<UniChatPluginMetadata[]>([]);

    const { metadata } = React.useContext(AppContext);

    function openPluginDetails(plugin: UniChatPluginMetadata): void {
        modalService.openModal({
            fullScreen: true,
            title: "Plugin Overview",
            actions: <PluginOverviewActions plugin={plugin} />,
            children: <PluginOverview plugin={plugin} />
        });
    }

    function getPluginIconDataUrl(plugin: UniChatPluginMetadata): string {
        let iconBytes = plugin.icon;

        if (iconBytes == null || iconBytes.length === 0) {
            iconBytes = metadata.icon;
        }

        const b64Icon = btoa(String.fromCharCode(...(iconBytes ?? [])));

        return `data:image/png;base64,${b64Icon}`;
    }

    async function handleFetchPlugins(): Promise<void> {
        try {
            const items = await commandService.getPlugins();
            setPlugins(items);
        } catch (error) {
            _logger.error("An error occurred on fetch plugins", error);

            notifications.show({
                title: "Fetch Error",
                message: "An error occurred while fetching plugins.",
                color: "red",
                icon: <i className="fas fa-times" />
            });
        }
    }

    React.useEffect(() => {
        handleFetchPlugins();
    }, []);

    return (
        <PluginsStyledContainer>
            <PluginsGridContainer cols={5}>
                {plugins
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((plugin) => {
                        const [bgColor, fgColor] = PLUGIN_STATUS_COLOR[plugin.status];

                        return (
                            <Tooltip key={plugin.name} label={plugin.name} position="bottom">
                                <Card onClick={() => openPluginDetails(plugin)} className="plugin-item">
                                    <Card.Section>
                                        <div className="badges-wrapper">
                                            {plugin.pluginPath == null ? (
                                                <Badge
                                                    radius="xs"
                                                    style={{
                                                        backgroundColor: "var(--mantine-color-gray-5)",
                                                        color: "var(--mantine-color-black)"
                                                    }}
                                                >
                                                    System
                                                </Badge>
                                            ) : (
                                                <Badge radius="xs" style={{ backgroundColor: bgColor, color: fgColor }}>
                                                    {plugin.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <img src={getPluginIconDataUrl(plugin)} />
                                    </Card.Section>
                                </Card>
                            </Tooltip>
                        );
                    })}
            </PluginsGridContainer>
        </PluginsStyledContainer>
    );
}

export function PluginsActions(_props: Props): React.ReactNode {
    const { metadata } = React.useContext(AppContext);

    return (
        <Button variant="outline" size="xs" onClick={() => revealItemInDir(metadata.pluginsDir)}>
            <i className="fas fa-folder" />
            &nbsp;Show Plugins Folder
        </Button>
    );
}
