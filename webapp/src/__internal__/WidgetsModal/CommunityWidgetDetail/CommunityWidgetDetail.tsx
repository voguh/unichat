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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Alert } from "@voguh/unichat-ui/Alert";
import { Badge } from "@voguh/unichat-ui/Badge";
import { Button, IconButton } from "@voguh/unichat-ui/Button";
import { Markdown } from "@voguh/unichat-ui/Markdown";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@voguh/unichat-ui/Tabs";
import { CommunityWidgetBadge } from "unichat/__internal__/WidgetsModal/CommunityWidgetBadge";
import { formatWarnings } from "unichat/__internal__/WidgetsModal/utils/formatWarnings";
import { getWidgetStatus, WidgetStatus } from "unichat/__internal__/WidgetsModal/utils/getWidgetStatus";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import type { AddonRelease, CommunityWidget } from "unichat/types/addons";
import { requireNonNull } from "unichat/utils/requireNonNull";

import styles from "./styles.module.css";

interface Props {
    widget: CommunityWidget;
    installing: string | null;
    onInstall: (widget: CommunityWidget, release: string) => void;
    onOpenFolder: (widget: CommunityWidget) => void;
}

function getReleases(detail: CommunityWidget | null): AddonRelease[] {
    if (detail != null) {
        return detail.releases ?? [];
    }

    return [];
}

function getLatestStable(releases: AddonRelease[], fallback: string): string {
    const stable = releases.find((release) => !release.prerelease);
    if (stable != null) {
        return stable.name;
    }

    return fallback;
}

function getDescription(detail: CommunityWidget | null): string | null {
    if (detail != null) {
        return detail.description;
    }

    return null;
}

const _logger = LoggerFactory.getLogger("CommunityWidgetDetail");
export function CommunityWidgetDetail({
    widget,
    installing,
    onInstall,
    onOpenFolder
}: Props): PReact.ComponentChildren {
    const { homepageUrl, installedVersion } = widget;
    const status = getWidgetStatus(widget);
    const loading = installing === widget.id;

    const [detail, setDetail] = useState<CommunityWidget | null>(null);

    const releases = getReleases(detail);
    const latestStable = getLatestStable(releases, widget.version);

    function renderMainActions(): PReact.ComponentChildren {
        switch (status) {
            case WidgetStatus.INCOMPATIBLE:
                return <Button disabled>Install {widget.version}</Button>;
            case WidgetStatus.UPDATE_AVAILABLE:
                return (
                    <div className={styles.actionRow}>
                        <IconButton aria-label="Open folder" onClick={() => onOpenFolder(widget)}>
                            <i className="fas fa-folder" />
                        </IconButton>
                        <Button variant="primary" loading={loading} onClick={() => onInstall(widget, latestStable)}>
                            Update to {latestStable}
                        </Button>
                    </div>
                );
            case WidgetStatus.INSTALLED:
                return (
                    requireNonNull(installedVersion) && (
                        <div className={styles.actionRow}>
                            <IconButton aria-label="Open folder" onClick={() => onOpenFolder(widget)}>
                                <i className="fas fa-folder" />
                            </IconButton>
                            <Button loading={loading} onClick={() => onInstall(widget, installedVersion)}>
                                Reinstall
                            </Button>
                        </div>
                    )
                );
            default:
                return (
                    <Button variant="primary" loading={loading} onClick={() => onInstall(widget, latestStable)}>
                        Install {latestStable}
                    </Button>
                );
        }
    }

    function renderReleaseAction(release: AddonRelease): PReact.ComponentChildren {
        if (release.name === widget.installedVersion) {
            return <Badge variant="success">Installed</Badge>;
        } else if (!widget.compatible && release.name === widget.version) {
            return (
                <Button size="sm" disabled>
                    Requires UniChat {widget.requiresUniChat}
                </Button>
            );
        }

        return (
            <Button size="sm" disabled={loading} onClick={() => onInstall(widget, release.name)}>
                Install
            </Button>
        );
    }

    useEffect(() => {
        async function handleFetchDetail(): Promise<void> {
            try {
                const communityWidget = await addonsService.getCommunityWidget(widget.id);
                setDetail(communityWidget);
            } catch (error) {
                _logger.error("An error occurred on fetch community widget", error);

                notificationService.error({
                    title: "Fetch Error",
                    message: "An error occurred while fetching widget details."
                });
            }
        }

        handleFetchDetail();
    }, [widget]);

    return (
        <div className={styles.detail}>
            <div className={styles.sidebar}>
                <img src={widget.previewUrl} />
                {renderMainActions()}
                {requireNonNull(homepageUrl) && (
                    <Button size="sm" onClick={() => openUrl(homepageUrl)}>
                        Homepage
                        <i className="fas fa-external-link-alt" />
                    </Button>
                )}
                <Button size="sm" onClick={() => openUrl(widget.repositoryUrl)}>
                    Repository
                    <i className="fas fa-external-link-alt" />
                </Button>
            </div>

            <div className={styles.main}>
                <div className={styles.titleRow}>
                    <h2>{widget.name}</h2>
                    <CommunityWidgetBadge widget={widget} />
                    {formatWarnings(widget.warnings)}
                </div>

                <div className={styles.meta}>
                    <span>v{widget.version}</span>
                    <span>{widget.author}</span>
                    <span>{widget.license}</span>
                    <span>
                        <i className="fas fa-star" /> {widget.stars}
                    </span>
                    {widget.updatedAt != null && <span>Updated {new Date(widget.updatedAt).toLocaleDateString()}</span>}
                </div>

                {status === WidgetStatus.INCOMPATIBLE && (
                    <Alert variant="danger">
                        Version {widget.version} requires UniChat {widget.requiresUniChat}. You are on {UNICHAT_VERSION}
                        .
                    </Alert>
                )}
                {status === WidgetStatus.UPDATE_AVAILABLE && (
                    <Alert variant="warning">
                        Installed {widget.installedVersion}. Version {latestStable} is available.
                    </Alert>
                )}

                <TabGroup className={styles.tabs}>
                    <TabList>
                        <Tab>Readme</Tab>
                        <Tab>Versions ({releases.length})</Tab>
                    </TabList>
                    <TabPanels className={styles.tabContent}>
                        <TabPanel>
                            <Markdown
                                content={getDescription(detail)}
                                relativeLinksBaseUrl={`${widget.repositoryUrl}/blob/HEAD/`}
                            />
                        </TabPanel>
                        <TabPanel className={styles.releases}>
                            {releases.map((release) => (
                                <div key={release.id} className={styles.release}>
                                    <div className={styles.releaseInfo}>
                                        <div className={styles.releaseName}>
                                            <strong>{release.name}</strong>
                                            {release.prerelease && <Badge variant="info">Prerelease</Badge>}
                                            {release.name === latestStable && (
                                                <Badge variant="secondary">Latest stable</Badge>
                                            )}
                                        </div>
                                        <small>{new Date(release.publishedAt).toLocaleDateString()}</small>
                                    </div>
                                    {renderReleaseAction(release)}
                                </div>
                            ))}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
}
