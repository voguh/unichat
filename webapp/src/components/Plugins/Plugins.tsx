/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { PluginOverview, PluginOverviewActions } from "./PluginOverview";
import { PluginsStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

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
            logger$error("An error occurred on fetch plugins", error);

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
            <table>
                <tbody>
                    {plugins
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((plugin) => {
                            const [bgColor, fgColor] = PLUGIN_STATUS_COLOR[plugin.status];

                            return (
                                <tr key={plugin.name}>
                                    <td className="plugin-icon">
                                        <img src={getPluginIconDataUrl(plugin)} />
                                    </td>
                                    <td className="plugin-name">
                                        <span>{plugin.name}</span>
                                    </td>
                                    <td className="plugin-badges">
                                        <span>
                                            {Strings.isNullOrEmpty(plugin.pluginPath) && (
                                                <Badge radius="xs" bg="blue">
                                                    <i className="fas fa-code-branch" /> Built-In
                                                </Badge>
                                            )}
                                            <Badge radius="xs" style={{ backgroundColor: bgColor, color: fgColor }}>
                                                {plugin.status}
                                            </Badge>
                                        </span>
                                    </td>
                                    <td className="plugin-actions">
                                        <Button variant="outline" size="xs" onClick={() => openPluginDetails(plugin)}>
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </PluginsStyledContainer>
    );
}

export function PluginsActions(_props: Props): React.ReactNode {
    const { metadata } = React.useContext(AppContext);

    return (
        <>
            <Button
                variant="outline"
                color="gray"
                size="xs"
                leftSection={<i className="fas fa-book" />}
                onClick={() => openUrl("https://voguh.github.io/unichat/#/plugins/getting_started")}
            >
                Read the Docs
            </Button>
            <Button
                variant="outline"
                size="xs"
                leftSection={<i className="fas fa-folder" />}
                onClick={() => revealItemInDir(metadata.pluginsDir)}
            >
                Show Plugins Folder
            </Button>
        </>
    );
}
