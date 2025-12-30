/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Code, Tooltip } from "@mantine/core";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";

import { PluginOverviewHeaderStyledContainer, PluginOverviewStyledContainer } from "./styled";

interface Props {
    plugin: UniChatPluginMetadata;
}

export function PluginOverview(props: Props): React.ReactNode {
    const { plugin } = props;
    const [bgColor, fgColor] = PLUGIN_STATUS_COLOR[plugin.status];

    const { metadata } = React.useContext(AppContext);

    function getPluginIconDataUrl(plugin: UniChatPluginMetadata): string {
        let iconBytes = plugin.icon;

        if (iconBytes == null || iconBytes.length === 0) {
            iconBytes = metadata.icon;
        }

        const b64Icon = btoa(String.fromCharCode(...(iconBytes ?? [])));

        return `data:image/png;base64,${b64Icon}`;
    }

    return (
        <PluginOverviewStyledContainer>
            <div className="plugin-details">
                <div className="plugin-icon">
                    <img src={getPluginIconDataUrl(plugin)} alt="Plugin Icon" />
                </div>
                <div className="plugin-meta">
                    <div className="plugin-name">
                        <div className="details-label">Name</div>
                        <div className="details-value">{plugin.name}</div>
                    </div>
                    <div className="plugin-version">
                        <div className="details-label">Version</div>
                        <div className="details-value">{plugin.version}</div>
                    </div>
                    <div className="plugin-status">
                        <div className="details-label">Status</div>
                        <div className="details-value">
                            <Badge radius="xs" style={{ backgroundColor: bgColor, color: fgColor }}>
                                {plugin.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="plugin-authors">
                        <div className="details-label">Authors</div>
                        <Tooltip label={plugin.author} position="bottom">
                            <div className="details-value">{plugin.author}</div>
                        </Tooltip>
                    </div>
                    <div className="plugin-license">
                        <div className="details-label">License</div>
                        <Tooltip label={plugin.license} position="bottom">
                            <div className="details-value">{plugin.license}</div>
                        </Tooltip>
                    </div>
                    <div className="plugin-homepage">
                        <div className="details-label">Homepage</div>
                        <div className="details-value" onClick={() => openUrl(plugin.homepage)}>
                            {plugin.homepage}
                        </div>
                    </div>
                    <div className="plugin-description">
                        <div className="details-label">Description</div>
                        <div className="details-value">{plugin.description}</div>
                    </div>
                </div>
            </div>
            <Code block className="plugin-messages">
                {plugin.messages.join("\n")}
            </Code>
        </PluginOverviewStyledContainer>
    );
}

export function PluginOverviewHeader(props: Props): React.ReactNode {
    const { plugin } = props;

    return (
        <PluginOverviewHeaderStyledContainer>
            <span>Plugin Overview</span>
            {plugin.pluginPath != null && (
                <div className="left-buttons">
                    <Button variant="outline" size="xs" onClick={() => revealItemInDir(plugin.pluginPath)}>
                        <i className="fas fa-folder" />
                        &nbsp; Show in Folder
                    </Button>
                </div>
            )}
        </PluginOverviewHeaderStyledContainer>
    );
}
