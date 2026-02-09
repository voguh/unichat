/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { UniChatWidget } from "unichat/types";

import { WidgetSourceType } from "./constants";

export function isSystemWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.SYSTEM;
}

export function isSystemPluginWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN;
}

export function isUserPluginWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.USER_PLUGIN;
}

export function isUserWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return widget.widgetSource.type === WidgetSourceType.USER;
}

/* ============================================================================================== */

export function isGeneralSystemWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.SYSTEM ||
        widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN
    );
}

export function isGeneralUserWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.USER_PLUGIN || widget.widgetSource.type === WidgetSourceType.USER
    );
}

export function isGeneralPluginWidget(widget: UniChatWidget | null | undefined): boolean {
    if (widget == null) {
        return false;
    }

    return (
        widget.widgetSource.type === WidgetSourceType.SYSTEM_PLUGIN ||
        widget.widgetSource.type === WidgetSourceType.USER_PLUGIN
    );
}
