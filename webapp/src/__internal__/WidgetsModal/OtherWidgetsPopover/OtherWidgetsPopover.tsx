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
import { formatWarningsSummary } from "unichat/__internal__/WidgetsModal/utils/formatWarnings";
import {
    isLocalWidgetDisplay,
    type WidgetLocalDisplayInfo
} from "unichat/__internal__/WidgetsModal/utils/toWidgetDisplays";
import type { WidgetsModalSharedStore } from "unichat/__internal__/WidgetsModal/WidgetsModal";
import { useModalContext } from "unichat/hooks/useModalContext";
import { useWidgets } from "unichat/hooks/useWidgets";
import type { WidgetMetadata } from "unichat/types/widgets";
import { isSystemWidget, isUserPluginWidget } from "unichat/utils/widgetSourceTypeGuards";

import styles from "./styles.module.css";

export function OtherWidgetsPopover(): PReact.ComponentChildren {
    const { sharedStore, setSharedStore } = useModalContext<WidgetsModalSharedStore>();
    const [widgets] = useWidgets((items) => items.sort((a, b) => a.restPath.localeCompare(b.restPath)), []);

    const systemWidgets = widgets.filter((w) => isSystemWidget(w) && w.restPath !== "example");
    const pluginWidgets = widgets.filter((w) => isUserPluginWidget(w));
    const localWidgets = (sharedStore.widgets ?? [])
        .filter(isLocalWidgetDisplay)
        .sort((a, b) => a.restPath.localeCompare(b.restPath));
    const count = systemWidgets.length + pluginWidgets.length + localWidgets.length;

    function renderWidget(widget: WidgetMetadata, subtitle: string | undefined): PReact.ComponentChildren {
        return (
            <div key={widget.restPath} className="widget">
                <span className="icon">
                    <i className="fas fa-window-maximize" />
                </span>
                <div>
                    <strong>{widget.restPath}</strong>
                    <small>{subtitle}</small>
                </div>
                {formatWarningsSummary(widget.warnings)}
            </div>
        );
    }

    function renderLocalWidget(widget: WidgetLocalDisplayInfo): PReact.ComponentChildren {
        return (
            <div key={widget.restPath} className="widget">
                <span className="icon">
                    <i className="fas fa-window-maximize" />
                </span>
                <div>
                    <strong>{widget.restPath}</strong>
                    <small>v{widget.version}</small>
                </div>
                {formatWarningsSummary(widget.warnings)}
                <Badge variant="secondary">Local</Badge>
                <IconButton
                    size="sm"
                    aria-label="Details"
                    onClick={() => setSharedStore((old) => ({ ...old, selectedWidget: widget }))}
                >
                    <i className="fas fa-chevron-right" />
                </IconButton>
            </div>
        );
    }

    if (count === 0) {
        return (
            <Button onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                <i className="fas fa-folder" />
                Show Widgets Folder
            </Button>
        );
    }

    return (
        <Popover className={styles.trigger}>
            <PopoverButton as={Button} variant="secondary">
                <i className="fas fa-cubes" />
                Other widgets ({count})
            </PopoverButton>
            <PopoverPanel anchor="bottom end" className={styles.root}>
                {systemWidgets.length > 0 && (
                    <div>
                        <div className="header">
                            <span>Built-in</span>
                        </div>
                        {systemWidgets.map((widget) => renderWidget(widget, "UniChat"))}
                    </div>
                )}
                {pluginWidgets.length > 0 && (
                    <div>
                        <div className="header">
                            <span>Plugins</span>
                        </div>
                        {pluginWidgets.map((widget) => renderWidget(widget, widget.widgetSource.value))}
                    </div>
                )}
                {localWidgets.length > 0 && (
                    <div>
                        <div className="header">
                            <span>Local</span>
                            <Button size="sm" onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                                <i className="fas fa-folder" />
                                Show Widgets Folder
                            </Button>
                        </div>
                        {localWidgets.map(renderLocalWidget)}
                    </div>
                )}
            </PopoverPanel>
        </Popover>
    );
}
