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
import { Badge } from "@voguh/unichat-ui/Badge";
import { Button, IconButton } from "@voguh/unichat-ui/Button";
import { Markdown } from "@voguh/unichat-ui/Markdown";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@voguh/unichat-ui/Tabs";
import { CommunityAddonBadge } from "unichat/__internal__/CommunityAddons/CommunityAddonBadge";
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
import { formatWarnings } from "unichat/__internal__/WidgetsModal/utils/formatWarnings";
import type { WidgetCommunityDisplay, WidgetDisplay } from "unichat/__internal__/WidgetsModal/utils/toWidgetDisplays";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import type { CommunityWidget } from "unichat/types/addons";
import { requireNonNull } from "unichat/utils/requireNonNull";

import styles from "./styles.module.css";

interface Props {
    widget: WidgetDisplay;
    installing: string | null;
    onInstall: (widget: CommunityWidget, release: string) => void;
    onOpenFolder: (id: string) => void;
}

const _logger = LoggerFactory.getLogger("WidgetDetail");
export function WidgetDetail({ widget, installing, onInstall, onOpenFolder }: Props): PReact.ComponentChildren {
    const { homepageUrl } = widget;
    const loading = installing === widget.id;

    const [detail, setDetail] = useState<CommunityWidget | null>(null);

    const releases = getReleases(detail);
    const latestStable = getLatestStable(releases, widget.version);

    function renderMainActions(addon: WidgetCommunityDisplay): PReact.ComponentChildren {
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

    function renderCommunityAlert(addon: WidgetCommunityDisplay): PReact.ComponentChildren {
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

    function renderContent(): PReact.ComponentChildren {
        if (widget.variant === "local") {
            return widget.description != null && <p>{widget.description}</p>;
        }

        return (
            <TabGroup>
                <TabList>
                    <Tab>Readme</Tab>
                    <Tab>Versions ({releases.length})</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Markdown
                            content={getDescription(detail)}
                            relativeLinksBaseUrl={`${widget.repositoryUrl}/blob/HEAD/`}
                        />
                    </TabPanel>
                    <TabPanel>
                        <CommunityAddonReleases
                            addon={widget}
                            releases={releases}
                            latestStable={latestStable}
                            loading={loading}
                            onInstall={(release) => onInstall(widget, release)}
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        );
    }

    useEffect(() => {
        if (widget.variant === "local") {
            return;
        }

        async function handleFetchDetail(internalId: string): Promise<void> {
            try {
                const communityWidget = await addonsService.getCommunityWidget(internalId);
                setDetail(communityWidget);
            } catch (error) {
                _logger.error("An error occurred on fetch community widget", error);

                notificationService.error({
                    title: "Fetch Error",
                    message: "An error occurred while fetching widget details."
                });
            }
        }

        handleFetchDetail(widget.internalId);
    }, [widget]);

    return (
        <div className={styles.root}>
            <div className="sidebar">
                {widget.variant !== "local" ? (
                    <img src={widget.previewUrl} />
                ) : (
                    <div className="no-preview">
                        <i className="fas fa-image" />
                        <span>No preview</span>
                    </div>
                )}
                {widget.variant !== "local" ? (
                    renderMainActions(widget)
                ) : (
                    <Button onClick={() => revealItemInDir(widget.path)}>
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
                {widget.variant !== "local" && (
                    <Button size="sm" onClick={() => openUrl(widget.repositoryUrl)}>
                        Repository
                        <i className="fas fa-external-link-alt" />
                    </Button>
                )}
            </div>

            <div className="main">
                <div className="title">
                    <h2>{widget.name}</h2>
                    {widget.variant === "local" ? (
                        <Badge variant="secondary">Local</Badge>
                    ) : (
                        <CommunityAddonBadge addon={widget} />
                    )}
                    {widget.variant !== "community" && formatWarnings(widget.warnings)}
                </div>

                <div className="meta">
                    <span>v{widget.version}</span>
                    {widget.author != null && <span>{widget.author}</span>}
                    {widget.license != null && <span>{widget.license}</span>}
                    {widget.variant !== "local" && (
                        <span>
                            <i className="fas fa-star" /> {widget.stars}
                        </span>
                    )}
                    {widget.variant !== "local" && widget.updatedAt != null && (
                        <span>Updated {new Date(widget.updatedAt).toLocaleDateString()}</span>
                    )}
                </div>

                {widget.variant !== "local" && renderCommunityAlert(widget)}

                {renderContent()}
            </div>
        </div>
    );
}
