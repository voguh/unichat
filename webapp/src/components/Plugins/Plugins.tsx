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

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { UniChatPluginMetadata } from "unichat/types";
import { PLUGIN_STATUS_COLOR } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { PluginOverview, PluginOverviewActions } from "./PluginOverview";
import { PluginsStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger("Plugins");
export function Plugins(_props: Props): React.ReactNode {
    const [plugins, setPlugins] = React.useState<UniChatPluginMetadata[]>([]);

    function openPluginDetails(plugin: UniChatPluginMetadata): void {
        modalService.openModal({
            fullscreen: true,
            title: "Plugin Overview",
            actions: <PluginOverviewActions plugin={plugin} />,
            children: <PluginOverview plugin={plugin} />
        });
    }

    function getPluginIconDataUrl(plugin: UniChatPluginMetadata): string {
        if (Strings.isNullOrEmpty(plugin.icon)) {
            return UNICHAT_ICON;
        } else {
            return plugin.icon;
        }
    }

    async function handleFetchPlugins(): Promise<void> {
        try {
            const items = await commandService.getPlugins();
            setPlugins(items);
        } catch (error) {
            _logger.error("An error occurred on fetch plugins", error);

            notificationService.error({ title: "Fetch Error", message: "An error occurred while fetching plugins." });
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
                                    <td style={{ width: 44 }} className="plugin-icon">
                                        <img src={getPluginIconDataUrl(plugin)} />
                                    </td>
                                    <td className="plugin-name">
                                        <span>{plugin.name}</span>
                                    </td>
                                    <td className="plugin-badges">
                                        <span>
                                            {Strings.isNullOrEmpty(plugin.pluginPath) && (
                                                <Badge>
                                                    <i className="fas fa-code-branch" /> BUILT-IN
                                                </Badge>
                                            )}
                                            <Badge bg="default" style={{ background: bgColor, color: fgColor }}>
                                                {plugin.status}
                                            </Badge>
                                        </span>
                                    </td>
                                    <td style={{ width: 80 }} className="plugin-actions">
                                        <Button variant="default" onClick={() => openPluginDetails(plugin)}>
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
    return (
        <>
            <Button
                variant="default"
                onClick={() => openUrl("https://voguh.github.io/unichat/#/plugins/getting_started")}
            >
                <i className="fas fa-book" />
                Read the Docs
            </Button>
            <Button variant="outline-primary" onClick={() => revealItemInDir(UNICHAT_PLUGINS_DIR)}>
                <i className="fas fa-folder" />
                Show Plugins Folder
            </Button>
        </>
    );
}
