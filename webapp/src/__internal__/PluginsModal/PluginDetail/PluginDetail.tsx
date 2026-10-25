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
import { useEffect, useState } from "preact/hooks";

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { Alert } from "@voguh/unichat-ui/Alert";
import { Button, IconButton } from "@voguh/unichat-ui/Button";
import { Markdown } from "@voguh/unichat-ui/Markdown";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@voguh/unichat-ui/Tabs";
import { CommunityAddonReleases } from "unichat/__internal__/CommunityAddons/CommunityAddonReleases";
import {
    getDescription,
    getLatestStable,
    getReleases
} from "unichat/__internal__/CommunityAddons/utils/communityAddonReleases";
import {
    CommunityAddonStatus,
    getCommunityAddonStatus
} from "unichat/__internal__/CommunityAddons/utils/getCommunityAddonStatus";
import { PluginBadges } from "unichat/__internal__/PluginsModal/PluginBadges";
import type { PluginCommunityDisplay, PluginDisplay } from "unichat/__internal__/PluginsModal/utils/toPluginDisplays";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import type { CommunityPlugin } from "unichat/types/addons";
import { PluginStatus } from "unichat/utils/constants";
import { requireNonNull } from "unichat/utils/requireNonNull";

import styles from "./styles.module.css";

interface Props {
    plugin: PluginDisplay;
    installing: string | null;
    onInstall: (plugin: CommunityPlugin, release: string) => void;
    onOpenFolder: (id: string) => void;
}

const _logger = LoggerFactory.getLogger("PluginDetail");
export function PluginDetail({ plugin, installing, onInstall, onOpenFolder }: Props): PReact.ComponentChildren {
    const { homepageUrl } = plugin;
    const loading = installing === plugin.id;
    const failed =
        plugin.variant !== "community" &&
        plugin.status != null &&
        [PluginStatus.ERROR, PluginStatus.INVALID].includes(plugin.status);

    const [detail, setDetail] = useState<CommunityPlugin | null>(null);

    const releases = getReleases(detail);
    const latestStable = getLatestStable(releases, plugin.version);

    function renderMainActions(addon: PluginCommunityDisplay): PReact.ComponentChildren {
        const { installedVersion } = addon;

        switch (getCommunityAddonStatus(addon)) {
            case CommunityAddonStatus.INCOMPATIBLE:
                return <Button disabled>Install {addon.version}</Button>;
            case CommunityAddonStatus.UPDATE_AVAILABLE:
                return (
                    <div>
                        <IconButton aria-label="Open folder" onClick={() => onOpenFolder(addon.id)}>
                            <i className="fas fa-folder" />
                        </IconButton>
                        <Button variant="primary" loading={loading} onClick={() => onInstall(addon, latestStable)}>
                            Update to {latestStable}
                        </Button>
                    </div>
                );
            case CommunityAddonStatus.INSTALLED:
                return (
                    requireNonNull(installedVersion) && (
                        <div>
                            <IconButton aria-label="Open folder" onClick={() => onOpenFolder(addon.id)}>
                                <i className="fas fa-folder" />
                            </IconButton>
                            <Button loading={loading} onClick={() => onInstall(addon, installedVersion)}>
                                Reinstall
                            </Button>
                        </div>
                    )
                );
            default:
                return (
                    <Button variant="primary" loading={loading} onClick={() => onInstall(addon, latestStable)}>
                        Install {latestStable}
                    </Button>
                );
        }
    }

    function renderCommunityAlert(addon: PluginCommunityDisplay): PReact.ComponentChildren {
        switch (getCommunityAddonStatus(addon)) {
            case CommunityAddonStatus.INCOMPATIBLE:
                return (
                    <Alert variant="danger">
                        Version {addon.version} requires UniChat {addon.requiresUniChat}. You are on {UNICHAT_VERSION}.
                    </Alert>
                );
            case CommunityAddonStatus.UPDATE_AVAILABLE:
                return (
                    <Alert variant="warning">
                        Installed {addon.installedVersion}. Version {latestStable} is available.
                    </Alert>
                );
            default:
                return null;
        }
    }

    function renderLogs(messages: string[]): PReact.ComponentChildren {
        return <pre>{messages.join("\n")}</pre>;
    }

    function renderTabs(): PReact.ComponentChildren {
        if (plugin.variant === "local") {
            return (
                <TabGroup>
                    <TabList>
                        <Tab>Logs</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel className="logs">{renderLogs(plugin.messages)}</TabPanel>
                    </TabPanels>
                </TabGroup>
            );
        }

        return (
            <TabGroup>
                <TabList>
                    <Tab>Readme</Tab>
                    <Tab>Versions ({releases.length})</Tab>
                    <Tab disabled={plugin.variant === "community" || plugin.status == null}>Logs</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Markdown
                            content={getDescription(detail)}
                            relativeLinksBaseUrl={`${plugin.repositoryUrl}/blob/HEAD/`}
                        />
                    </TabPanel>
                    <TabPanel>
                        <CommunityAddonReleases
                            addon={plugin}
                            releases={releases}
                            latestStable={latestStable}
                            loading={loading}
                            onInstall={(release) => onInstall(plugin, release)}
                        />
                    </TabPanel>
                    <TabPanel className="logs">
                        {plugin.variant === "installed" && renderLogs(plugin.messages)}
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        );
    }

    useEffect(() => {
        if (plugin.variant === "local") {
            return;
        }

        async function handleFetchDetail(internalId: string): Promise<void> {
            try {
                const communityPlugin = await addonsService.getCommunityPlugin(internalId);
                setDetail(communityPlugin);
            } catch (error) {
                _logger.error("An error occurred on fetch community plugin", error);

                notificationService.error({
                    title: "Fetch Error",
                    message: "An error occurred while fetching plugin details."
                });
            }
        }

        handleFetchDetail(plugin.internalId);
    }, [plugin]);

    return (
        <div className={styles.root}>
            <div className="sidebar">
                <img src={plugin.iconUrl} />
                {plugin.variant !== "local" ? (
                    renderMainActions(plugin)
                ) : (
                    <Button onClick={() => revealItemInDir(plugin.path)}>
                        <i className="fas fa-folder" />
                        Show in Folder
                    </Button>
                )}
                {requireNonNull(homepageUrl) && (
                    <Button size="sm" onClick={() => openUrl(homepageUrl)}>
                        Homepage
                        <i className="fas fa-external-link-alt" />
                    </Button>
                )}
                {plugin.variant !== "local" && (
                    <Button size="sm" onClick={() => openUrl(plugin.repositoryUrl)}>
                        Repository
                        <i className="fas fa-external-link-alt" />
                    </Button>
                )}
            </div>

            <div className="main">
                <div className="title">
                    <h2>{plugin.name}</h2>
                    <PluginBadges plugin={plugin} />
                </div>

                <div className="meta">
                    <span>v{plugin.version}</span>
                    {plugin.author != null && <span>{plugin.author}</span>}
                    {plugin.license != null && <span>{plugin.license}</span>}
                    {plugin.variant !== "local" && (
                        <span>
                            <i className="fas fa-star" /> {plugin.stars}
                        </span>
                    )}
                    {plugin.variant !== "local" && plugin.updatedAt != null && (
                        <span>Updated {new Date(plugin.updatedAt).toLocaleDateString()}</span>
                    )}
                </div>

                {plugin.variant !== "local" && renderCommunityAlert(plugin)}
                {failed && <Alert variant="danger">{plugin.name} failed to load. Check the logs for details.</Alert>}

                {renderTabs()}
            </div>
        </div>
    );
}
