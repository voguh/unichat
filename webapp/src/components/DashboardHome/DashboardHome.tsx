/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, ComboboxData, List, Select, Tooltip } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { UniChatScrapper } from "unichat/types";
import { scrapperPriority, UniChatSettings, WIDGET_URL_PREFIX } from "unichat/utils/constants";

import { ScrapperCard } from "./ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidgetUrl, setSelectedWidgetUrl] = React.useState(`${WIDGET_URL_PREFIX}/default`);
    const [widgets, setWidgets] = React.useState<ComboboxData>([]);
    const [scrappers, setScrappers] = React.useState<UniChatScrapper[]>([]);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { showWidgetPreview } = React.useContext(AppContext);

    function mountEditingTooltip(message: string, availableUrls: string[]): React.ReactNode {
        // prettier-ignore
        return (
            <>
                {message}
                <br />
                <List size="xs">
                    {availableUrls.map((url, idx) => <li key={idx}>{url}</li>)}
                </List>
                <br />
                You can enter the URL with or without the <Badge size="xs" radius="xs">www.</Badge> prefix.
                <br />
                You can also include or omit the <Badge size="xs" radius="xs" color="green">https://</Badge> or <Badge size="xs" radius="xs" color="red">http://</Badge> prefix.
            </>
        );
    }

    /* ====================================================================== */

    async function handleFetchWidgets(): Promise<ComboboxData> {
        const widgets = await commandService.listWidgets();

        return widgets.map((groupItem) => ({
            group: groupItem.group,
            items: groupItem.items
                .filter((item) => item !== "example")
                .map((item) => `${WIDGET_URL_PREFIX}/${item}`)
                .sort((a, b) => a.localeCompare(b))
        }));
    }

    async function reloadIframe(): Promise<void> {
        const widgets = await handleFetchWidgets();
        setWidgets(widgets);

        if (iframeRef.current) {
            iframeRef.current.src = selectedWidgetUrl;
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await handleFetchWidgets();
            setWidgets(widgets);

            const defaultPreviewWidget = await commandService.settingsGetItem(UniChatSettings.DEFAULT_PREVIEW_WIDGET);
            setSelectedWidgetUrl(`${WIDGET_URL_PREFIX}/${defaultPreviewWidget}`);

            const scrappers = await commandService.getScrappers();
            const sortedScrappers = scrappers.sort((a, b) => {
                const pa = scrapperPriority(a.id);
                const pb = scrapperPriority(b.id);

                if (pa !== pb) {
                    return pa - pb;
                }

                return a.name.localeCompare(b.name);
            });
            setScrappers(sortedScrappers);
        }

        init();
    }, []);

    return (
        <DashboardHomeStyledContainer>
            <div className="fields">
                {scrappers.map((s) => (
                    <ScrapperCard
                        key={s.id}
                        editingTooltip={mountEditingTooltip(s.editingTooltipMessage, s.editingTooltipUrls)}
                        validateUrl={(value) => commandService.validateScrapperUrl(s.id, value)}
                        scrapper={s}
                    />
                ))}
            </div>
            <div className="preview">
                {showWidgetPreview ? (
                    <>
                        <Card className="preview-header" withBorder shadow="xs">
                            <div className="preview-header-widget-selector">
                                <Select
                                    value={selectedWidgetUrl}
                                    data={widgets}
                                    onChange={setSelectedWidgetUrl}
                                    data-tour="widgets-selector"
                                />
                            </div>

                            <Tooltip label="Reload widget view" position="left" withArrow>
                                <Button onClick={reloadIframe} data-tour="preview-reload">
                                    <i className="fas fa-sync" />
                                </Button>
                            </Tooltip>

                            <Tooltip label="Open in browser" position="left" withArrow>
                                <Button onClick={() => openUrl(selectedWidgetUrl)} data-tour="preview-open-in-browser">
                                    <i className="fas fa-globe" />
                                </Button>
                            </Tooltip>
                        </Card>
                        <div className="iframe-wrapper">
                            <iframe ref={iframeRef} src={selectedWidgetUrl} sandbox="allow-scripts" />
                        </div>
                    </>
                ) : (
                    <div className="iframe-placeholder">Widget preview is disabled.</div>
                )}
            </div>
        </DashboardHomeStyledContainer>
    );
}
