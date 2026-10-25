/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { getPluginIconDataUrl } from "unichat/__internal__/PluginsModal/utils/getPluginIconDataUrl";
import type { CommunityPlugin } from "unichat/types/addons";
import type { PluginMetadata } from "unichat/types/plugins";
import type { PluginStatus } from "unichat/utils/constants";

export interface PluginDisplayInfo {
    id: string;
    name: string;
    version: string;
    author: string | null;
    license: string | null;
    homepageUrl: string | null;
    iconUrl: string;
}

export interface PluginRuntimeInfo {
    path: string;
    messages: string[];
}

export interface PluginCommunityDisplayInfo extends CommunityPlugin {
    variant: "community";
}

export interface PluginInstalledDisplayInfo extends CommunityPlugin, PluginRuntimeInfo {
    variant: "installed";
    status: PluginStatus | null;
}

export interface PluginLocalDisplayInfo extends PluginDisplayInfo, PluginRuntimeInfo {
    variant: "local";
    status: PluginStatus;
}

export type PluginDisplay = PluginCommunityDisplayInfo | PluginInstalledDisplayInfo | PluginLocalDisplayInfo;
export type PluginCommunityDisplay = PluginCommunityDisplayInfo | PluginInstalledDisplayInfo;

function toCommunityDisplay(plugin: CommunityPlugin, localPlugin: PluginMetadata | null): PluginCommunityDisplay {
    if (plugin.installedVersion == null) {
        return { ...plugin, variant: "community" };
    } else if (localPlugin != null) {
        const { path, status, messages } = localPlugin;
        return { ...plugin, variant: "installed", path, status, messages };
    }

    return { ...plugin, variant: "installed", path: `${UNICHAT_PLUGINS_DIR}/${plugin.id}`, status: null, messages: [] };
}

function toLocalDisplay(plugin: PluginMetadata): PluginLocalDisplayInfo {
    const { id, name, version, author, license, homepage, path, status, messages } = plugin;

    return {
        variant: "local",
        id,
        name,
        version,
        author,
        license,
        homepageUrl: homepage,
        iconUrl: getPluginIconDataUrl(plugin),
        path,
        status,
        messages
    };
}

export function toPluginDisplays(communityPlugins: CommunityPlugin[], localPlugins: PluginMetadata[]): PluginDisplay[] {
    const displays: PluginDisplay[] = [];
    for (const plugin of communityPlugins) {
        const localPlugin = localPlugins.find((item) => item.id === plugin.id) ?? null;
        displays.push(toCommunityDisplay(plugin, localPlugin));
    }

    for (const plugin of localPlugins) {
        if (!communityPlugins.some((item) => item.id === plugin.id)) {
            displays.push(toLocalDisplay(plugin));
        }
    }

    return displays;
}

export function isCommunityPluginDisplay(plugin: PluginDisplay): plugin is PluginCommunityDisplay {
    return plugin.variant !== "local";
}

export function isLocalPluginDisplay(plugin: PluginDisplay): plugin is PluginLocalDisplayInfo {
    return plugin.variant === "local";
}
