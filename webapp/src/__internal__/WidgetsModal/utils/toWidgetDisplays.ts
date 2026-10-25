/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { CommunityWidget } from "unichat/types/addons";
import type { WidgetMetadata } from "unichat/types/widgets";
import { isUserWidget } from "unichat/utils/widgetSourceTypeGuards";

export interface WidgetDisplayInfo {
    id: string;
    name: string;
    version: string;
    author: string | null;
    license: string | null;
    homepageUrl: string | null;
}

export interface WidgetRuntimeInfo {
    path: string;
    restPath: string;
    warnings: string[];
}

export interface WidgetCommunityDisplayInfo extends CommunityWidget {
    variant: "community";
}

export interface WidgetInstalledDisplayInfo extends CommunityWidget, WidgetRuntimeInfo {
    variant: "installed";
}

export interface WidgetLocalDisplayInfo extends WidgetDisplayInfo, WidgetRuntimeInfo {
    variant: "local";
    description: string | null;
}

export type WidgetDisplay = WidgetCommunityDisplayInfo | WidgetInstalledDisplayInfo | WidgetLocalDisplayInfo;
export type WidgetCommunityDisplay = WidgetCommunityDisplayInfo | WidgetInstalledDisplayInfo;

function toCommunityDisplay(widget: CommunityWidget, localWidget: WidgetMetadata | null): WidgetCommunityDisplay {
    if (widget.installedVersion == null) {
        return { ...widget, variant: "community" };
    } else if (localWidget != null) {
        const { path, restPath, warnings } = localWidget;
        return { ...widget, variant: "installed", path, restPath, warnings };
    }

    return {
        ...widget,
        variant: "installed",
        path: `${UNICHAT_WIDGETS_DIR}/${widget.id}`,
        restPath: widget.id,
        warnings: []
    };
}

function toLocalDisplay(widget: WidgetMetadata): WidgetLocalDisplayInfo {
    const { id, name, version, author, license, homepage, description, path, restPath, warnings } = widget;

    return {
        variant: "local",
        id,
        name,
        version,
        author,
        license,
        homepageUrl: homepage,
        description,
        path,
        restPath,
        warnings
    };
}

export function toWidgetDisplays(communityWidgets: CommunityWidget[], localWidgets: WidgetMetadata[]): WidgetDisplay[] {
    const userWidgets = localWidgets.filter(isUserWidget);

    const displays: WidgetDisplay[] = [];
    for (const widget of communityWidgets) {
        const localWidget = userWidgets.find((item) => item.id === widget.id) ?? null;
        displays.push(toCommunityDisplay(widget, localWidget));
    }

    for (const widget of userWidgets) {
        if (!communityWidgets.some((item) => item.id === widget.id)) {
            displays.push(toLocalDisplay(widget));
        }
    }

    return displays;
}

export function isCommunityWidgetDisplay(widget: WidgetDisplay): widget is WidgetCommunityDisplay {
    return widget.variant !== "local";
}

export function isLocalWidgetDisplay(widget: WidgetDisplay): widget is WidgetLocalDisplayInfo {
    return widget.variant === "local";
}
