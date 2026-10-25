/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { SelectOption, SelectOptionGroup } from "@voguh/unichat-ui/components/ui/Select";
import type { WidgetMetadata } from "unichat/types/widgets";

import { isSystemWidget, isUserWidget } from "./widgetSourceTypeGuards";

export interface WidgetSelectOption extends SelectOption {
    warnings: string[];
}

export interface WidgetSelectOptionGroup extends SelectOptionGroup {
    options: WidgetSelectOption[];
}

export function toWidgetOptionGroup(widgets: Iterable<WidgetMetadata>): WidgetSelectOptionGroup[] {
    const systemWidgets: WidgetSelectOption[] = [];
    const userWidgets: WidgetSelectOption[] = [];
    const pluginWidgets: WidgetSelectOption[] = [];

    for (const widget of widgets) {
        if (widget.restPath === "example") {
            continue;
        }

        if (isSystemWidget(widget)) {
            systemWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        } else if (isUserWidget(widget)) {
            userWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        } else {
            pluginWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        }
    }

    const options: WidgetSelectOptionGroup[] = [];

    if (systemWidgets.length > 0) {
        options.push({
            label: "System Widgets",
            options: systemWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    if (userWidgets.length > 0) {
        options.push({
            label: "User Widgets",
            options: userWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    if (pluginWidgets.length > 0) {
        options.push({
            label: "Plugin Widgets",
            options: pluginWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    return options;
}
