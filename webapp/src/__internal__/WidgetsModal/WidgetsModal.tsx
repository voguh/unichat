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

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AccordionItem } from "unichat/components/AccordionItem";
import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { Tooltip } from "unichat/components/Tooltip";
import { useWidgets } from "unichat/hooks/useWidgets";
import { Variants } from "unichat/types";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { WidgetsStyledTable } from "./styled";

interface WidgetWarning {
    message: string | PReact.ComponentChildren;
    details: string;
    variant: Variants;
}

export function WidgetsModal(): PReact.ComponentChildren {
    const [openedWidgetGroup, setOpenedWidgetGroup] = useState<string | null>(null);
    const [widgets, _reloadWidgets] = useWidgets(toWidgetOptionGroup, []);

    function formatWarning(warning: string): WidgetWarning | undefined {
        switch (warning) {
            case "DUPLICATE_HTML_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-html5" /> Duplicated
                        </>
                    ),
                    details: "This widget contains multiple HTML entrypoints. Only 'widget.html' will be used.",
                    variant: "danger"
                };
            case "LEGACY_HTML_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-html5" /> Legacy
                        </>
                    ),
                    details: "This widget uses a deprecated HTML entrypoint. Consider renaming it to 'widget.html'.",
                    variant: "warning"
                };
            case "DUPLICATE_JS_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-js" /> Duplicated
                        </>
                    ),
                    details: "This widget contains multiple JS entrypoints. Only 'widget.js' will be used.",
                    variant: "danger"
                };
            case "LEGACY_JS_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-js" /> Legacy
                        </>
                    ),
                    details: "This widget uses a deprecated JS entrypoint. Consider renaming it to 'widget.js'.",
                    variant: "warning"
                };
            case "DUPLICATE_CSS_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-css3-alt" /> Duplicated
                        </>
                    ),
                    details: "This widget contains multiple CSS entrypoints. Only 'widget.css' will be used.",
                    variant: "danger"
                };
            case "LEGACY_CSS_ENTRYPOINT":
                return {
                    message: (
                        <>
                            <i className="fab fa-css3-alt" /> Legacy
                        </>
                    ),
                    details: "This widget uses a deprecated CSS entrypoint. Consider renaming it to 'widget.css'.",
                    variant: "warning"
                };
        }
    }

    function formatWarnings(warnings: string[]): PReact.ComponentChildren {
        return warnings.map((warning) => {
            const formattedWarning = formatWarning(warning);
            if (formattedWarning == null) {
                return null;
            }

            const { message, details, variant } = formattedWarning;

            return (
                <Tooltip key={warning} content={details} placement="bottom">
                    <Badge variant={variant}>{message}</Badge>
                </Tooltip>
            );
        });
    }

    return (
        <div className="flex flex-col gap-2">
            {widgets.map((widgetGroup) => (
                <AccordionItem
                    key={widgetGroup.label}
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
                                                {formatWarnings(widget.warnings)}
                                                {widgetGroup.label === "User Widgets" && (
                                                    <Tooltip content="Reveal in Folder" placement="bottom">
                                                        <Button
                                                            variant="default"
                                                            onClick={() =>
                                                                revealItemInDir(
                                                                    `${UNICHAT_WIDGETS_DIR}/${widget.label}`
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-folder" />
                                                        </Button>
                                                    </Tooltip>
                                                )}

                                                <Tooltip content="Open in Browser" placement="bottom">
                                                    <Button variant="default" onClick={() => openUrl(widget.label)}>
                                                        <i className="fas fa-external-link-alt" />
                                                    </Button>
                                                </Tooltip>
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
