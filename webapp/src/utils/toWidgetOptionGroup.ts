/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { SelectItem, SelectItemGroup } from "@voguh/unichat-ui/components/ui/Select";
import type { UniChatLocalWidget } from "unichat/types/addons";

import { isSystemWidget, isUserWidget } from "./widgetSourceTypeGuards";

export interface WidgetSelectItem extends SelectItem {
    warnings: string[];
}

export interface WidgetSelectItemGroup extends SelectItemGroup {
    items: WidgetSelectItem[];
}

export function toWidgetOptionGroup(widgets: Iterable<UniChatLocalWidget>): WidgetSelectItemGroup[] {
    const systemWidgets: WidgetSelectItem[] = [];
    const userWidgets: WidgetSelectItem[] = [];
    const pluginWidgets: WidgetSelectItem[] = [];

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

    const options: WidgetSelectItemGroup[] = [];

    if (systemWidgets.length > 0) {
        options.push({
            label: "System Widgets",
            items: systemWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    if (userWidgets.length > 0) {
        options.push({
            label: "User Widgets",
            items: userWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    if (pluginWidgets.length > 0) {
        options.push({
            label: "Plugin Widgets",
            items: pluginWidgets.sort((a, b) => a.label.localeCompare(b.label))
        });
    }

    return options;
}
