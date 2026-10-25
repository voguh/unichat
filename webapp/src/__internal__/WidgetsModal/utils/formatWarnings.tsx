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

import { Badge } from "@voguh/unichat-ui/Badge";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import type { Variants } from "unichat/types";

interface WidgetWarning {
    message: string | PReact.ComponentChildren;
    details: string;
    variant: Variants;
}

function formatWarning(warning: string): WidgetWarning | undefined {
    switch (warning) {
        case "MISSING_MANIFEST":
            return {
                message: (
                    <>
                        <i className="fas fa-file-alt" /> No manifest
                    </>
                ),
                details: "This widget has no 'manifest.yaml'. Its version is unknown.",
                variant: "warning"
            };
        case "MANIFEST_NAME_MISMATCH":
            return {
                message: (
                    <>
                        <i className="fas fa-file-alt" /> Name
                    </>
                ),
                details:
                    "The name in 'manifest.yaml' differs from the widget folder name. The folder name will be used.",
                variant: "warning"
            };
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

export function formatWarnings(warnings: string[]): PReact.ComponentChildren {
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
