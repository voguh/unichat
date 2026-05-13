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

import { openUrl } from "@tauri-apps/plugin-opener";

import { getPluginIconDataUrl } from "unichat/__internal__/PluginsModal/utils/getPluginIconDataUrl";
import { handleBadgeVariant } from "unichat/__internal__/PluginsModal/utils/handleBadgeVariant";
import { Badge } from "unichat/components/Badge";
import { Tooltip } from "unichat/components/Tooltip";
import { UniChatPluginMetadata } from "unichat/types";

import { PluginOverviewStyledContainer } from "./styled";

interface Props {
    plugin: UniChatPluginMetadata;
}

export function PluginOverviewModal({ plugin }: Props): PReact.ComponentChildren {
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
                            <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                        </div>
                    </div>
                    <div className="plugin-authors">
                        <div className="details-label">Authors</div>
                        <Tooltip placement="bottom" content={plugin.author}>
                            <div className="details-value">{plugin.author}</div>
                        </Tooltip>
                    </div>
                    <div className="plugin-license">
                        <div className="details-label">License</div>
                        <Tooltip placement="bottom" content={plugin.license}>
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
