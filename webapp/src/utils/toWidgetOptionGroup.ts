/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Option, OptionGroupBase } from "unichat/components/forms/Select";
import { UniChatWidget } from "unichat/types";

import { isSystemWidget, isUserWidget } from "./widgetSourceTypeGuards";

export function toWidgetOptionGroup(widgets: Iterable<UniChatWidget>): OptionGroupBase<Option>[] {
    const systemWidgets = [];
    const userWidgets = [];
    const pluginWidgets = [];

    for (const widget of widgets) {
        if (isSystemWidget(widget)) {
            systemWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        } else if (isUserWidget(widget)) {
            userWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        } else {
            pluginWidgets.push({ value: widget.restPath, label: widget.restPath, warnings: widget.warnings });
        }
    }

    const options: OptionGroupBase<Option>[] = [];

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
