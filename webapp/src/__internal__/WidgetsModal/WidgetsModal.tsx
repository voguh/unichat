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
    isCommunityWidgetDisplay,
    toWidgetDisplays,
    type WidgetDisplay
} from "unichat/__internal__/WidgetsModal/utils/toWidgetDisplays";
import { useModalContext } from "unichat/hooks/useModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { addonsService } from "unichat/services/addonsService";
import { notificationService } from "unichat/services/notificationService";
import type { CommunityWidget } from "unichat/types/addons";

import { CommunityWidgetsShowcase } from "./CommunityWidgetsShowcase";
import styles from "./styles.module.css";
import { WidgetDetail } from "./WidgetDetail";

export interface SelectedWidget {
    id: string;
    name: string;
}

export interface WidgetsModalSharedStore {
    widgets: WidgetDisplay[];
    selectedWidget: SelectedWidget | null;
}

const _logger = LoggerFactory.getLogger("WidgetsModal");
export function WidgetsModal(): PReact.ComponentChildren {
    const [widgets, setWidgets] = useState<WidgetDisplay[] | null>(null);
    const [installing, setInstalling] = useState<string | null>(null);

    const { sharedStore, setSharedStore } = useModalContext<WidgetsModalSharedStore>();

    async function fetchCommunityWidgets(): Promise<void> {
        try {
            const [communityWidgets, localWidgets] = await Promise.all([
                addonsService.getCommunityWidgets(),
                addonsService.getLocalWidgets()
            ]);
            const displays = toWidgetDisplays(communityWidgets, localWidgets);
            setWidgets(displays);
            setSharedStore((old) => ({ ...old, widgets: displays }));
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
                releaseName = await resolveInstallRelease(widget, (id) => addonsService.getCommunityWidget(id));
            }

            await addonsService.installCommunityWidget(widget.internalId, releaseName);
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

    function openWidgetFolder(id: string): void {
        revealItemInDir(`${UNICHAT_WIDGETS_DIR}/${id}`);
    }

    function renderContent(): PReact.ComponentChildren {
        const { selectedWidget } = sharedStore;

        if (widgets == null) {
            return <Loading show label="Loading widgets" />;
        }

        if (selectedWidget != null) {
            const widget = widgets.find((item) => item.id === selectedWidget.id);
            if (widget != null) {
                return (
                    <WidgetDetail
                        widget={widget}
                        installing={installing}
                        onInstall={installWidget}
                        onOpenFolder={openWidgetFolder}
                    />
                );
            }
        }

        return (
            <CommunityWidgetsShowcase
                widgets={widgets.filter(isCommunityWidgetDisplay)}
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
