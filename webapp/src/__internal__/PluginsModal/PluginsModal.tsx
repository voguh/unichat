/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Loading } from "@voguh/unichat-ui/Loading";
import { resolveInstallRelease } from "unichat/__internal__/CommunityAddons/utils/communityAddonReleases";
import {
    isCommunityPluginDisplay,
    type PluginDisplay,
    toPluginDisplays
} from "unichat/__internal__/PluginsModal/utils/toPluginDisplays";
import { useModalContext } from "unichat/hooks/useModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import { StorageKeys, storageService } from "unichat/services/storageService";
import type { CommunityPlugin } from "unichat/types/addons";

import { CommunityPluginsShowcase } from "./CommunityPluginsShowcase";
import { PluginDetail } from "./PluginDetail";
import styles from "./styles.module.css";

export interface SelectedPlugin {
    id: string;
    name: string;
}

export interface PluginsModalSharedStore {
    plugins: PluginDisplay[];
    selectedPlugin: SelectedPlugin | null;
}

const _logger = LoggerFactory.getLogger("PluginsModal");
export function PluginsModal(): PReact.ComponentChildren {
    const [plugins, setPlugins] = useState<PluginDisplay[] | null>(null);
    const [installing, setInstalling] = useState<string | null>(null);

    const { sharedStore, setSharedStore } = useModalContext<PluginsModalSharedStore>();

    async function fetchCommunityPlugins(): Promise<void> {
        try {
            const [communityPlugins, localPlugins] = await Promise.all([
                addonsService.getCommunityPlugins(),
                addonsService.getLocalPlugins()
            ]);
            const displays = toPluginDisplays(communityPlugins, localPlugins);
            setPlugins(displays);
            setSharedStore((old) => ({ ...old, plugins: displays }));
        } catch (error) {
            _logger.error("An error occurred on fetch plugins", error);

            notificationService.error({
                title: "Fetch Error",
                message: "An error occurred while fetching plugins."
            });
        }
    }

    async function installPlugin(plugin: CommunityPlugin, release?: string): Promise<void> {
        try {
            setInstalling(plugin.id);

            let releaseName = release;
            if (releaseName == null) {
                releaseName = await resolveInstallRelease(plugin, (id) => addonsService.getCommunityPlugin(id));
            }

            await addonsService.installCommunityPlugin(plugin.internalId, releaseName);
            const pending = storageService.get(StorageKeys.PLUGINS_REQUIRES_RESTART);
            if (!pending.includes(plugin.id)) {
                storageService.set(StorageKeys.PLUGINS_REQUIRES_RESTART, [...pending, plugin.id]);
            }

            notificationService.success({ title: "Success", message: `${plugin.name} ${releaseName} installed.` });
            await fetchCommunityPlugins();
        } catch (error) {
            _logger.error("An error occurred on install community plugin", error);

            notificationService.error({
                title: "Install Error",
                message: `An error occurred while installing ${plugin.name}.`
            });
        } finally {
            setInstalling(null);
        }
    }

    function openPluginFolder(id: string): void {
        revealItemInDir(`${UNICHAT_PLUGINS_DIR}/${id}`);
    }

    function renderContent(): PReact.ComponentChildren {
        const { selectedPlugin } = sharedStore;

        if (plugins == null) {
            return <Loading show label="Loading plugins" />;
        }

        if (selectedPlugin != null) {
            const plugin = plugins.find((item) => item.id === selectedPlugin.id);
            if (plugin != null) {
                return (
                    <PluginDetail
                        plugin={plugin}
                        installing={installing}
                        onInstall={installPlugin}
                        onOpenFolder={openPluginFolder}
                    />
                );
            }
        }

        return (
            <CommunityPluginsShowcase
                plugins={plugins.filter(isCommunityPluginDisplay)}
                installing={installing}
                onSelect={(plugin) => setSharedStore((old) => ({ ...old, selectedPlugin: plugin }))}
                onInstall={installPlugin}
                onOpenFolder={openPluginFolder}
            />
        );
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        fetchCommunityPlugins();
    }, []);

    return <div className={styles.root}>{renderContent()}</div>;
}
