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
import { useModalContext } from "unichat/hooks/useModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import type { CommunityWidget } from "unichat/types/addons";

import { CommunityShowcase } from "./CommunityShowcase";
import { CommunityWidgetDetail } from "./CommunityWidgetDetail";
import styles from "./styles.module.css";

export interface WidgetsModalSharedStore {
    communityWidgetNames: string[];
    selectedWidget: CommunityWidget | null;
}

const _logger = LoggerFactory.getLogger("WidgetsModal");
export function WidgetsModal(): PReact.ComponentChildren {
    const [communityWidgets, setCommunityWidgets] = useState<CommunityWidget[] | null>(null);
    const [installing, setInstalling] = useState<string | null>(null);

    const { sharedStore, setSharedStore } = useModalContext<WidgetsModalSharedStore>();

    async function fetchCommunityWidgets(): Promise<void> {
        try {
            const items = await addonsService.getCommunityWidgets();
            setCommunityWidgets(items);
            setSharedStore((old) => ({ ...old, communityWidgetNames: items.map((item) => item.name) }));
        } catch (error) {
            _logger.error("An error occurred on fetch community widgets", error);

            notificationService.error({
                title: "Fetch Error",
                message: "An error occurred while fetching community widgets."
            });
        }
    }

    async function installWidget(widget: CommunityWidget, release?: string): Promise<void> {
        try {
            setInstalling(widget.id);

            let releaseName = release;
            if (releaseName == null) {
                const detail = await addonsService.getCommunityWidget(widget.id);
                const latestStable = (detail.releases ?? []).find((item) => !item.prerelease);

                releaseName = widget.version;
                if (latestStable != null) {
                    releaseName = latestStable.name;
                }
            }

            await addonsService.installCommunityWidget(widget.id, releaseName);
            notificationService.success({ title: "Success", message: `${widget.name} ${releaseName} installed.` });
            await fetchCommunityWidgets();
        } catch (error) {
            _logger.error("An error occurred on install community widget", error);

            notificationService.error({
                title: "Install Error",
                message: `An error occurred while installing ${widget.name}.`
            });
        } finally {
            setInstalling(null);
        }
    }

    function openWidgetFolder(widget: CommunityWidget): void {
        revealItemInDir(`${UNICHAT_WIDGETS_DIR}/${widget.name}`);
    }

    function renderContent(): PReact.ComponentChildren {
        const { selectedWidget } = sharedStore;

        if (communityWidgets == null) {
            return <Loading show label="Loading widgets" />;
        }

        if (selectedWidget != null) {
            const currentWidget = communityWidgets.find((widget) => widget.id === selectedWidget.id);
            if (currentWidget != null) {
                return (
                    <CommunityWidgetDetail
                        widget={currentWidget}
                        installing={installing}
                        onInstall={installWidget}
                        onOpenFolder={openWidgetFolder}
                    />
                );
            }
        }

        return (
            <CommunityShowcase
                widgets={communityWidgets}
                installing={installing}
                onSelect={(widget) => setSharedStore((old) => ({ ...old, selectedWidget: widget }))}
                onInstall={installWidget}
                onOpenFolder={openWidgetFolder}
            />
        );
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        fetchCommunityWidgets();
    }, []);

    return <div className={styles.root}>{renderContent()}</div>;
}
