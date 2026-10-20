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
                <Tooltip.Root key={warning} positioning={{ placement: "bottom" }}>
                    <Tooltip.Trigger asChild>
                        <Badge variant={variant}>{message}</Badge>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{details}</Tooltip.Content>
                </Tooltip.Root>
            );
        });
    }

    return (
        <Accordion.Root collapsible className={styles.accordion}>
            {widgets.map((widgetGroup) => (
                <Accordion.Item key={widgetGroup.label} value={widgetGroup.label}>
                    <Accordion.ItemTrigger>
                        <span className={styles.groupTitle}>{widgetGroup.label}</span>
                        <Accordion.ItemIndicator>
                            <i className="fas fa-chevron-down" />
                        </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
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
                                                        <Tooltip.Root positioning={{ placement: "bottom" }}>
                                                            <Tooltip.Trigger asChild>
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
                                                            </Tooltip.Trigger>
                                                            <Tooltip.Content>Reveal in Folder</Tooltip.Content>
                                                        </Tooltip.Root>
                                                    )}

                                                    <Tooltip.Root positioning={{ placement: "bottom" }}>
                                                        <Tooltip.Trigger asChild>
                                                            <Button
                                                                variant="default"
                                                                onClick={() => openUrl(widget.label)}
                                                            >
                                                                <i className="fas fa-external-link-alt" />
                                                            </Button>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content>Open in Browser</Tooltip.Content>
                                                    </Tooltip.Root>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
}
