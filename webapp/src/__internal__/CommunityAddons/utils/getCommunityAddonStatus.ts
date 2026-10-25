/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { CommunityAddon } from "unichat/types/addons";

export enum CommunityAddonStatus {
    INCOMPATIBLE = "INCOMPATIBLE",
    UPDATE_AVAILABLE = "UPDATE_AVAILABLE",
    INSTALLED = "INSTALLED",
    AVAILABLE = "AVAILABLE"
}

export function getCommunityAddonStatus(addon: CommunityAddon): CommunityAddonStatus {
    if (!addon.compatible) {
        return CommunityAddonStatus.INCOMPATIBLE;
    } else if (addon.hasUpdate) {
        return CommunityAddonStatus.UPDATE_AVAILABLE;
    } else if (addon.installedVersion != null) {
        return CommunityAddonStatus.INSTALLED;
    }

    return CommunityAddonStatus.AVAILABLE;
}
