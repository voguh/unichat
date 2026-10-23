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

export enum WidgetStatus {
    INCOMPATIBLE = "INCOMPATIBLE",
    UPDATE_AVAILABLE = "UPDATE_AVAILABLE",
    INSTALLED = "INSTALLED",
    AVAILABLE = "AVAILABLE"
}

export function getWidgetStatus(widget: CommunityWidget): WidgetStatus {
    if (!widget.compatible) {
        return WidgetStatus.INCOMPATIBLE;
    } else if (widget.hasUpdate) {
        return WidgetStatus.UPDATE_AVAILABLE;
    } else if (widget.installedVersion != null) {
        return WidgetStatus.INSTALLED;
    }

    return WidgetStatus.AVAILABLE;
}
