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
import { useState } from "preact/hooks";

import { sep } from "@tauri-apps/api/path";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AccordionItem } from "unichat/components/AccordionItem";
import { Button } from "unichat/components/Button";
import { useWidgets } from "unichat/hooks/useWidgets";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { WidgetsStyledTable } from "./styled";

export function WidgetsModal(): PReact.ComponentChildren {
    const [openedWidgetGroup, setOpenedWidgetGroup] = useState<string | null>(null);
    const [widgets, _reloadWidgets] = useWidgets(toWidgetOptionGroup, []);

    return (
        <div className="flex flex-col gap-2">
            {widgets.map((widgetGroup, idx) => (
                <AccordionItem
                    key={idx}
                    open={openedWidgetGroup === widgetGroup.label}
                    toggle={() => setOpenedWidgetGroup((old) => (old === widgetGroup.label ? null : widgetGroup.label))}
                    header={widgetGroup.label}
                >
                    <WidgetsStyledTable>
                        <tbody>
                            {widgetGroup.options
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((widget) => (
                                    <tr key={widget.label}>
                                        <td className="widget-name">
                                            <span>{widget.label}</span>
                                        </td>
                                        <td className="plugin-actions">
                                            <div>
                                                {widgetGroup.label === "User Widgets" && (
                                                    <Button
                                                        variant="default"
                                                        onClick={() =>
                                                            revealItemInDir(
                                                                `${UNICHAT_WIDGETS_DIR}${sep()}${widget.label}`
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-folder" />
                                                        Reveal in Folder
                                                    </Button>
                                                )}
                                                <Button variant="default" onClick={() => openUrl(widget.label)}>
                                                    <i className="fas fa-external-link-alt" />
                                                    Open in Browser
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </WidgetsStyledTable>
                </AccordionItem>
            ))}
        </div>
    );
}

export function WidgetsModalActions(): PReact.ComponentChildren {
    return (
        <>
            <Button
                variant="default"
                onClick={() => openUrl("https://unichat.voguh.me/docs/1.4.x/widgets/getting_started.html")}
            >
                <i className="fas fa-book" />
                Read the Docs
            </Button>
            <Button onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                <i className="fas fa-folder" />
                Show Widgets Folder
            </Button>
        </>
    );
}
