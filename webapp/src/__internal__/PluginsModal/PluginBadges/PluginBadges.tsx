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
import { CommunityAddonBadge } from "unichat/__internal__/CommunityAddons/CommunityAddonBadge";
import { handleBadgeVariant } from "unichat/__internal__/PluginsModal/utils/handleBadgeVariant";
import type { PluginDisplay } from "unichat/__internal__/PluginsModal/utils/toPluginDisplays";
import { useStorage } from "unichat/hooks/useStorage";
import { StorageKeys } from "unichat/services/storageService";

interface Props {
    plugin: PluginDisplay;
}

export function PluginBadges({ plugin }: Props): PReact.ComponentChildren {
    const [pluginsRequiresRestart] = useStorage(StorageKeys.PLUGINS_REQUIRES_RESTART);

    function renderRuntimeBadge(): PReact.ComponentChildren {
        if (pluginsRequiresRestart.includes(plugin.id)) {
            return <Badge variant="info">Restart required</Badge>;
        } else if (plugin.variant !== "community" && plugin.status != null) {
            return <Badge variant={handleBadgeVariant(plugin.status)}>{plugin.status}</Badge>;
        }

        return null;
    }

    return (
        <>
            {plugin.variant === "local" ? (
                <Badge variant="secondary">Local</Badge>
            ) : (
                <CommunityAddonBadge addon={plugin} />
            )}
            {renderRuntimeBadge()}
        </>
    );
}
