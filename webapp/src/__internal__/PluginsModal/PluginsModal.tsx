/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { Badge } from "@voguh/unichat-ui/components/ui/Badge";
import { Button } from "@voguh/unichat-ui/components/ui/Button";
import { EmptyState } from "@voguh/unichat-ui/components/ui/EmptyState";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import type { PluginMetadata } from "unichat/types/plugins";

import { PluginOverviewModal, PluginOverviewModalActions } from "./PluginOverview";
import styles from "./styles.module.css";
import { getPluginIconDataUrl } from "./utils/getPluginIconDataUrl";
import { handleBadgeVariant } from "./utils/handleBadgeVariant";

const _logger = LoggerFactory.getLogger("Plugins");
export function PluginsModal(): PReact.ComponentChildren {
    const [plugins, setPlugins] = useState<PluginMetadata[]>([]);

    function openPluginDetails(plugin: PluginMetadata): void {
        modalService.openModal({
            fullscreen: true,
            title: "Plugin Overview",
            actions: <PluginOverviewModalActions plugin={plugin} />,
            children: <PluginOverviewModal plugin={plugin} />
        });
    }

    useEffect(() => {
        async function handleFetchPlugins(): Promise<void> {
            try {
                const items = await addonsService.getLocalPlugins();
                setPlugins(items);
            } catch (error) {
                _logger.error("An error occurred on fetch plugins", error);

                notificationService.error({
                    title: "Fetch Error",
                    message: "An error occurred while fetching plugins."
                });
            }
        }

        handleFetchPlugins();
    }, []);

    if (plugins.length === 0) {
        return <EmptyState icon={<i className="fas fa-cubes" />} title="No plugins installed" />;
    }

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <tbody>
                    {plugins
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((plugin) => (
                            <tr key={plugin.name}>
                                <td className={styles.icon}>
                                    <img src={getPluginIconDataUrl(plugin)} />
                                </td>
                                <td>
                                    <span>{plugin.name}</span>
                                </td>
                                <td className={styles.badges}>
                                    <div>
                                        <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                                    </div>
                                </td>
                                <td className={styles.actions}>
                                    <Button onClick={() => openPluginDetails(plugin)}>Details</Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
