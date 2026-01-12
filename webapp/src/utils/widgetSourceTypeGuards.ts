/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import { UniChatWidget } from "unichat/types";

import { WidgetSourceType } from "./constants";

export function isSystemWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.SYSTEM;
}

export function isSystemPluginWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN;
}

export function isUserPluginWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.USER_PLUGIN;
}

export function isUserWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.USER;
}

/* ============================================================================================== */

export function isGeneralSystemWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.SYSTEM ||
        widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN
    );
}

export function isGeneralUserWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.USER_PLUGIN || widget.widgetSource.type === WidgetSourceType.USER
    );
}

export function isGeneralPluginWidget(widget: UniChatWidget): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN ||
        widget.widgetSource.type === WidgetSourceType.USER_PLUGIN
    );
}
