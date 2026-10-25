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

import { Badge } from "@voguh/unichat-ui/Badge";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import { getPluginIconDataUrl } from "unichat/__internal__/PluginsModal/utils/getPluginIconDataUrl";
import { handleBadgeVariant } from "unichat/__internal__/PluginsModal/utils/handleBadgeVariant";
import type { PluginMetadata } from "unichat/types/plugins";

import styles from "./styles.module.css";

interface Props {
    plugin: PluginMetadata;
}

export function PluginOverviewModal({ plugin }: Props): PReact.ComponentChildren {
    return (
        <div className={styles.root}>
            <div>
                <div className="icon">
                    <img src={getPluginIconDataUrl(plugin)} />
                </div>
                <div className="meta">
                    <div className="name">
                        <div className="label">Name</div>
                        <div className="value">{plugin.name}</div>
                    </div>
                    <div className="version">
                        <div className="label">Version</div>
                        <div className="value">{plugin.version}</div>
                    </div>
                    <div className="status">
                        <div className="label">Status</div>
                        <div className="value">
                            <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                        </div>
                    </div>
                    <div className="authors">
                        <div className="label">Authors</div>
                        <Tooltip placement="bottom" content={plugin.author}>
                            <div className="value">{plugin.author}</div>
                        </Tooltip>
                    </div>
                    <div className="license">
                        <div className="label">License</div>
                        <Tooltip placement="bottom" content={plugin.license}>
                            <div className="value">{plugin.license}</div>
                        </Tooltip>
                    </div>
                    <div className="homepage">
                        <div className="label">Homepage</div>
                        <div className="value" onClick={() => plugin.homepage && openUrl(plugin.homepage)}>
                            {plugin.homepage}
                        </div>
                    </div>
                    <div className="description">
                        <div className="label">Description</div>
                        <div className="value">{plugin.description}</div>
                    </div>
                </div>
            </div>
            <pre>{plugin.messages.join("\n")}</pre>
        </div>
    );
}
