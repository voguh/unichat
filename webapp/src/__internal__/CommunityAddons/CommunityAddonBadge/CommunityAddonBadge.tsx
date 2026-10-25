/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";

import { Badge } from "@voguh/unichat-ui/Badge";
import {
    CommunityAddonStatus,
    getCommunityAddonStatus
} from "unichat/__internal__/CommunityAddons/utils/getCommunityAddonStatus";
import type { CommunityAddon } from "unichat/types/addons";

interface Props {
    addon: CommunityAddon;
}

export function CommunityAddonBadge({ addon }: Props): PReact.ComponentChildren {
    switch (getCommunityAddonStatus(addon)) {
        case CommunityAddonStatus.INCOMPATIBLE:
            return <Badge variant="danger">Requires UniChat {addon.requiresUniChat}</Badge>;
        case CommunityAddonStatus.UPDATE_AVAILABLE:
            return (
                <Badge variant="warning">
                    Update {addon.installedVersion} <i className="fas fa-arrow-right" /> {addon.version}
                </Badge>
            );
        case CommunityAddonStatus.INSTALLED:
            return <Badge variant="success">Installed {addon.installedVersion}</Badge>;
        default:
            return null;
    }
}
