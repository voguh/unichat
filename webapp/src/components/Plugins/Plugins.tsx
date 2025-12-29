/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Card } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

import { AppContext } from "unichat/contexts/AppContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";

import { PluginOverview } from "./PluginOverview";
import { PluginsGridContainer, PluginsStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger(import.meta.url);
export function Plugins(props: Props): React.ReactNode {
    const [plugins, setPlugins] = React.useState<UniChatPluginMetadata[]>([]);

    const { metadata } = React.useContext(AppContext);

    function openPluginDetails(plugin: UniChatPluginMetadata): void {
        modals.open({
            title: "Plugin Overview",
            children: <PluginOverview plugin={plugin} />,
            fullScreen: true
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
            console.log(error);
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
                {plugins.map((plugin) => {
                    const [bgColor, fgColor] = PLUGIN_STATUS_COLOR[plugin.status];

                    return (
                        <Card key={plugin.name} onClick={() => openPluginDetails(plugin)} className="plugin-item">
                            <Card.Section>
                                <div className="icon-wrapper">
                                    <img src={getPluginIconDataUrl(plugin)} />
                                </div>
                            </Card.Section>
                            <div className="name-wrapper">{plugin.name}</div>
                            <Badge radius="xs" style={{ backgroundColor: bgColor, color: fgColor }}>
                                {plugin.status}
                            </Badge>
                        </Card>
                    );
                })}
            </PluginsGridContainer>
        </PluginsStyledContainer>
    );
}
