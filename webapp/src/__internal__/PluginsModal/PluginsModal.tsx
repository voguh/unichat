/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { UniChatPluginMetadata } from "unichat/types";
import { Strings } from "unichat/utils/Strings";

import { PluginOverviewModal, PluginOverviewModalActions } from "./PluginOverview";
import { PluginsStyledContainer } from "./styled";
import { getPluginIconDataUrl } from "./utils/getPluginIconDataUrl";
import { handleBadgeVariant } from "./utils/handleBadgeVariant";

const _logger = LoggerFactory.getLogger("Plugins");
export function PluginsModal(): PReact.ComponentChildren {
    const [plugins, setPlugins] = useState<UniChatPluginMetadata[]>([]);

    function openPluginDetails(plugin: UniChatPluginMetadata): void {
        modalService.openModal({
            fullscreen: true,
            title: "Plugin Overview",
            actions: <PluginOverviewModalActions plugin={plugin} />,
            children: <PluginOverviewModal plugin={plugin} />
        });
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

    useEffect(() => {
        handleFetchPlugins();
    }, []);

    return (
        <PluginsStyledContainer>
            <table>
                <tbody>
                    {plugins
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((plugin) => (
                            <tr key={plugin.name}>
                                <td className="plugin-icon">
                                    <img src={getPluginIconDataUrl(plugin)} />
                                </td>
                                <td className="plugin-name">
                                    <span>{plugin.name}</span>
                                </td>
                                <td className="plugin-badges">
                                    <div>
                                        {Strings.isNullOrEmpty(plugin.pluginPath) && (
                                            <Badge>
                                                <i className="fas fa-code-branch" /> BUILT-IN
                                            </Badge>
                                        )}
                                        <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                                    </div>
                                </td>
                                <td className="plugin-actions">
                                    <Button onClick={() => openPluginDetails(plugin)}>Details</Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </PluginsStyledContainer>
    );
}
