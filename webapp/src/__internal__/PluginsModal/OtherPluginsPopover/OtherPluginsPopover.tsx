/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Badge } from "@voguh/unichat-ui/Badge";
import { Button, IconButton } from "@voguh/unichat-ui/Button";
import { Popover, PopoverButton, PopoverPanel } from "@voguh/unichat-ui/Popover";
import { ScrollableView } from "@voguh/unichat-ui/ScrollableView";
import type { PluginsModalSharedStore } from "unichat/__internal__/PluginsModal/PluginsModal";
import { handleBadgeVariant } from "unichat/__internal__/PluginsModal/utils/handleBadgeVariant";
import { isLocalPluginDisplay } from "unichat/__internal__/PluginsModal/utils/toPluginDisplays";
import { useModalContext } from "unichat/hooks/useModalContext";

import styles from "./styles.module.css";

export function OtherPluginsPopover(): PReact.ComponentChildren {
    const { sharedStore, setSharedStore } = useModalContext<PluginsModalSharedStore>();

    const plugins = (sharedStore.plugins ?? [])
        .filter(isLocalPluginDisplay)
        .sort((a, b) => a.name.localeCompare(b.name));

    if (plugins.length === 0) {
        return (
            <Button onClick={() => revealItemInDir(UNICHAT_PLUGINS_DIR)}>
                <i className="fas fa-folder" />
                Show Plugins Folder
            </Button>
        );
    }

    return (
        <Popover className={styles.trigger}>
            <PopoverButton as={Button} variant="secondary">
                <i className="fas fa-cubes" />
                Other plugins ({plugins.length})
            </PopoverButton>
            <PopoverPanel anchor="bottom end" className={styles.root}>
                <ScrollableView>
                    <div className="header">
                        <span>Local</span>
                        <Button size="sm" onClick={() => revealItemInDir(UNICHAT_PLUGINS_DIR)}>
                            <i className="fas fa-folder" />
                            Show Plugins Folder
                        </Button>
                    </div>
                    {plugins.map((plugin) => (
                        <div key={plugin.id} className="plugin">
                            <img src={plugin.iconUrl} />
                            <div>
                                <strong>{plugin.name}</strong>
                                <small>v{plugin.version}</small>
                            </div>
                            <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>
                            <IconButton
                                size="sm"
                                aria-label="Details"
                                onClick={() => setSharedStore((old) => ({ ...old, selectedPlugin: plugin }))}
                            >
                                <i className="fas fa-chevron-right" />
                            </IconButton>
                        </div>
                    ))}
                </ScrollableView>
            </PopoverPanel>
        </Popover>
    );
}
