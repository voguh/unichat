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

import { Badge } from "@voguh/unichat-ui/components/ui/Badge";
import { Button, IconButton } from "@voguh/unichat-ui/components/ui/Button";
import { Popover, PopoverButton, PopoverPanel } from "@voguh/unichat-ui/components/ui/Popover";
import { formatWarnings } from "unichat/__internal__/WidgetsModal/utils/formatWarnings";
import { useWidgets } from "unichat/hooks/useWidgets";
import type { WidgetMetadata } from "unichat/types/widgets";
import { isSystemWidget, isUserPluginWidget, isUserWidget } from "unichat/utils/widgetSourceTypeGuards";

import styles from "./styles.module.css";

interface Props {
    communityWidgetNames: string[];
}

export function OtherWidgetsPopover({ communityWidgetNames }: Props): PReact.ComponentChildren {
    const [widgets] = useWidgets((items) => items.sort((a, b) => a.restPath.localeCompare(b.restPath)), []);

    const groups = [
        { label: "Built-in", items: widgets.filter((w) => isSystemWidget(w) && w.restPath !== "example") },
        { label: "Plugins", items: widgets.filter((w) => isUserPluginWidget(w)) },
        {
            label: "Local",
            items: widgets.filter((w) => isUserWidget(w) && !communityWidgetNames.includes(w.restPath)),
            rightContent: (
                <Button size="sm" onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                    <i className="fas fa-folder" />
                    Show Widgets Folder
                </Button>
            )
        }
    ].filter((group) => group.items.length > 0);
    const count = groups.reduce((total, group) => total + group.items.length, 0);

    function renderSubtitle(widget: WidgetMetadata): string | undefined {
        if (isSystemWidget(widget)) {
            return "UniChat";
        } else if (isUserPluginWidget(widget)) {
            return widget.widgetSource.value;
        }

        return `v${widget.version}`;
    }

    function renderWidget(widget: WidgetMetadata): PReact.ComponentChildren {
        const local = isUserWidget(widget);

        return (
            <div key={widget.restPath} className={styles.widget}>
                <span className={styles.widgetIcon}>
                    <i className="fas fa-window-maximize" />
                </span>
                <div className={styles.widgetInfo}>
                    <strong>{widget.restPath}</strong>
                    <small>{renderSubtitle(widget)}</small>
                </div>
                {formatWarnings(widget.warnings)}
                {local && <Badge variant="secondary">Local</Badge>}
                {local && (
                    <IconButton aria-label="Reveal in Folder" onClick={() => revealItemInDir(widget.path)}>
                        <i className="fas fa-folder" />
                    </IconButton>
                )}
            </div>
        );
    }

    return (
        <Popover>
            <PopoverButton as={Button} variant="secondary">
                <i className="fas fa-cubes" />
                Other widgets ({count})
            </PopoverButton>
            <PopoverPanel anchor="bottom end" className={styles.content}>
                {groups.map((group) => (
                    <div key={group.label} className={styles.group}>
                        <div className={styles.groupHeader}>
                            <span className={styles.groupLabel}>{group.label}</span>
                            {group.rightContent}
                        </div>
                        {group.items.map(renderWidget)}
                    </div>
                ))}
            </PopoverPanel>
        </Popover>
    );
}
