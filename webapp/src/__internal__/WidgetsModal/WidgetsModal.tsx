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

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { Accordion } from "@voguh/unichat-ui/components/ui/Accordion";
import { Badge } from "@voguh/unichat-ui/components/ui/Badge";
import { Button } from "@voguh/unichat-ui/components/ui/Button";
import { Tooltip } from "@voguh/unichat-ui/components/ui/Tooltip";
import { useWidgets } from "unichat/hooks/useWidgets";
import type { Variants } from "unichat/types";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import styles from "./styles.module.css";

interface WidgetWarning {
    message: string | PReact.ComponentChildren;
    details: string;
    variant: Variants;
}

export function WidgetsModal(): PReact.ComponentChildren {
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
                <Tooltip key={warning} placement="bottom" content={details}>
                    <Badge variant={variant}>{message}</Badge>
                </Tooltip>
            );
        });
    }

    return (
        <Accordion.Root className={styles.accordion}>
            {widgets.map((widgetGroup) => (
                <Accordion.Item key={widgetGroup.label} name="widget-groups" title={widgetGroup.label}>
                    <table className={styles.table}>
                        <tbody>
                            {widgetGroup.items
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((widget) => (
                                    <tr key={widget.label}>
                                        <td className={styles.name}>
                                            <span>{widget.label}</span>
                                        </td>
                                        <td className={styles.actions}>
                                            <div>
                                                {formatWarnings(widget.warnings)}
                                                {widgetGroup.label === "User Widgets" && (
                                                    <Tooltip placement="bottom" content="Reveal in Folder">
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

                                                <Tooltip placement="bottom" content="Open in Browser">
                                                    <Button variant="default" onClick={() => openUrl(widget.label)}>
                                                        <i className="fas fa-external-link-alt" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
}
