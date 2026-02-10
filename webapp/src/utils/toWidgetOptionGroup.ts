import { GroupBase, Option } from "unichat/components/forms/Select";
import { UniChatWidget } from "unichat/types";

import { isSystemWidget, isUserWidget } from "./widgetSourceTypeGuards";

export function toWidgetOptionGroup(widgets: Iterable<UniChatWidget>): GroupBase<Option>[] {
    const systemWidgets = [];
    const userWidgets = [];
    const pluginWidgets = [];

    for (const widget of widgets) {
        if (isSystemWidget(widget)) {
            systemWidgets.push({ value: widget.restPath, label: widget.restPath });
        } else if (isUserWidget(widget)) {
            userWidgets.push({ value: widget.restPath, label: widget.restPath });
        } else {
            pluginWidgets.push({ value: widget.restPath, label: widget.restPath });
        }
    }

    const options: GroupBase<Option>[] = [];

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
