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

import { Button } from "@voguh/unichat-ui/Button";
import { EmptyState } from "@voguh/unichat-ui/EmptyState";
import { CommunityAddonsToolbar } from "unichat/__internal__/CommunityAddons/CommunityAddonsToolbar";
import { useCommunityAddonsFilter } from "unichat/__internal__/CommunityAddons/hooks/useCommunityAddonsFilter";
import {
    CommunityAddonStatus,
    getCommunityAddonStatus
} from "unichat/__internal__/CommunityAddons/utils/getCommunityAddonStatus";
import { PluginBadges } from "unichat/__internal__/PluginsModal/PluginBadges";
import type { SelectedPlugin } from "unichat/__internal__/PluginsModal/PluginsModal";
import type { PluginCommunityDisplay } from "unichat/__internal__/PluginsModal/utils/toPluginDisplays";
import type { CommunityPlugin } from "unichat/types/addons";

import styles from "./styles.module.css";

interface Props {
    plugins: PluginCommunityDisplay[];
    installing: string | null;
    onSelect: (plugin: SelectedPlugin) => void;
    onInstall: (plugin: CommunityPlugin) => void;
    onOpenFolder: (id: string) => void;
}

export function CommunityPluginsShowcase({
    plugins,
    installing,
    onSelect,
    onInstall,
    onOpenFolder
}: Props): PReact.ComponentChildren {
    const filterState = useCommunityAddonsFilter(plugins);

    function renderAction(plugin: CommunityPlugin): PReact.ComponentChildren {
        const loading = installing === plugin.id;

        switch (getCommunityAddonStatus(plugin)) {
            case CommunityAddonStatus.INCOMPATIBLE:
                return (
                    <Button size="sm" disabled>
                        Incompatible
                    </Button>
                );
            case CommunityAddonStatus.UPDATE_AVAILABLE:
                return (
                    <Button size="sm" variant="primary" loading={loading} onClick={() => onInstall(plugin)}>
                        Update
                    </Button>
                );
            case CommunityAddonStatus.INSTALLED:
                return (
                    <Button size="sm" onClick={() => onOpenFolder(plugin.id)}>
                        Open folder
                    </Button>
                );
            default:
                return (
                    <Button size="sm" variant="primary" loading={loading} onClick={() => onInstall(plugin)}>
                        Install
                    </Button>
                );
        }
    }

    return (
        <div className={styles.root}>
            <CommunityAddonsToolbar placeholder="Search plugins" state={filterState} />

            <div className="content">
                {filterState.filteredAddons.length === 0 ? (
                    <EmptyState icon={<i className="fas fa-cubes" />} title="No plugins found" />
                ) : (
                    <div className="cards">
                        {filterState.filteredAddons.map((plugin) => (
                            <div key={plugin.id}>
                                <div className="header">
                                    <button
                                        type="button"
                                        aria-label={`Open ${plugin.name}`}
                                        onClick={() => onSelect(plugin)}
                                    >
                                        <img src={plugin.iconUrl} loading="lazy" />
                                    </button>
                                    <div>
                                        <strong>{plugin.name}</strong>
                                        <small>
                                            v{plugin.version} · {plugin.author} · {plugin.license}
                                        </small>
                                        <div>
                                            <PluginBadges plugin={plugin} />
                                        </div>
                                    </div>
                                </div>
                                <p>{plugin.shortDescription}</p>
                                <div className="actions">
                                    <Button size="sm" onClick={() => onSelect(plugin)}>
                                        Details
                                    </Button>
                                    {renderAction(plugin)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
