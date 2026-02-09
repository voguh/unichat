/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

import { Tooltip } from "unichat/components/OverlayTrigger";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { PluginOverviewStyledContainer } from "./styled";

interface Props {
    plugin: UniChatPluginMetadata;
}

export function PluginOverview(props: Props): React.ReactNode {
    const { plugin } = props;
    const [bgColor, fgColor] = PLUGIN_STATUS_COLOR[plugin.status];

    function getPluginIconDataUrl(plugin: UniChatPluginMetadata): string {
        if (Strings.isNullOrEmpty(plugin.icon)) {
            return UNICHAT_ICON;
        } else {
            return plugin.icon;
        }
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
                            <Badge bg="default" style={{ backgroundColor: bgColor, color: fgColor }}>
                                {plugin.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="plugin-authors">
                        <div className="details-label">Authors</div>
                        <Tooltip content={plugin.author} placement="bottom">
                            <div className="details-value">{plugin.author}</div>
                        </Tooltip>
                    </div>
                    <div className="plugin-license">
                        <div className="details-label">License</div>
                        <Tooltip content={plugin.license} placement="bottom">
                            <div className="details-value">{plugin.license}</div>
                        </Tooltip>
                    </div>
                    <div className="plugin-homepage">
                        <div className="details-label">Homepage</div>
                        <div className="details-value" onClick={() => plugin.homepage && openUrl(plugin.homepage)}>
                            {plugin.homepage}
                        </div>
                    </div>
                    <div className="plugin-description">
                        <div className="details-label">Description</div>
                        <div className="details-value">{plugin.description}</div>
                    </div>
                </div>
            </div>
            <pre className="plugin-messages">{plugin.messages.join("\n")}</pre>
        </PluginOverviewStyledContainer>
    );
}

export function PluginOverviewActions(props: Props): React.ReactNode {
    const {
        plugin: { pluginPath }
    } = props;

    return (
        <>
            {Strings.isNullOrEmpty(pluginPath) ? (
                <Button variant="dark" disabled>
                    Built-In Plugin
                </Button>
            ) : (
                <Button variant="outline-primary" onClick={() => revealItemInDir(pluginPath)}>
                    <i className="ti ti-folder" />
                    &nbsp;Show in Folder
                </Button>
            )}
        </>
    );
}
