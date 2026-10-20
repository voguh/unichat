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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Badge } from "@voguh/unichat-ui/components/ui/Badge";
import { Tooltip } from "@voguh/unichat-ui/components/ui/Tooltip";
import { getPluginIconDataUrl } from "unichat/__internal__/PluginsModal/utils/getPluginIconDataUrl";
import { handleBadgeVariant } from "unichat/__internal__/PluginsModal/utils/handleBadgeVariant";
import type { UniChatPluginMetadata } from "unichat/types";

import styles from "./styles.module.css";

interface Props {
    plugin: UniChatPluginMetadata;
}

export function PluginOverviewModal({ plugin }: Props): PReact.ComponentChildren {
    return (
        <div className={styles.container}>
            <div className={styles.details}>
                <div className={styles.icon}>
                    <img src={getPluginIconDataUrl(plugin)} />
                </div>
                <div className={styles.meta}>
                    <div className={styles.name}>
                        <div className={styles.label}>Name</div>
                        <div className={styles.value}>{plugin.name}</div>
                    </div>
                    <div className={styles.version}>
                        <div className={styles.label}>Version</div>
                        <div className={styles.value}>{plugin.version}</div>
                    </div>
                    <div className={styles.status}>
                        <div className={styles.label}>Status</div>
                        <div className={styles.value}>
                            <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                        </div>
                    </div>
                    <div className={styles.authors}>
                        <div className={styles.label}>Authors</div>
                        <Tooltip.Root positioning={{ placement: "bottom" }}>
                            <Tooltip.Trigger asChild>
                                <div className={styles.value}>{plugin.author}</div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>{plugin.author}</Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                    <div className={styles.license}>
                        <div className={styles.label}>License</div>
                        <Tooltip.Root positioning={{ placement: "bottom" }}>
                            <Tooltip.Trigger asChild>
                                <div className={styles.value}>{plugin.license}</div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>{plugin.license}</Tooltip.Content>
                        </Tooltip.Root>
                    </div>
                    <div className={styles.homepage}>
                        <div className={styles.label}>Homepage</div>
                        <div className={styles.value} onClick={() => plugin.homepage && openUrl(plugin.homepage)}>
                            {plugin.homepage}
                        </div>
                    </div>
                    <div className={styles.description}>
                        <div className={styles.label}>Description</div>
                        <div className={styles.value}>{plugin.description}</div>
                    </div>
                </div>
            </div>
            <pre className={styles.messages}>{plugin.messages.join("\n")}</pre>
        </div>
    );
}
