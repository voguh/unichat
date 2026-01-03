/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, ComboboxData, List, Menu, Select, Tooltip } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { UniChatScrapper } from "unichat/types";
import { scrapperPriority, UniChatSettings, WIDGET_URL_PREFIX } from "unichat/utils/constants";

import { QRCodeModal } from "./QRCodeModal";
import { ScrapperCard } from "./ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidgetUrl, setSelectedWidgetUrl] = React.useState(`${WIDGET_URL_PREFIX}/default`);
    const [widgets, setWidgets] = React.useState<ComboboxData>([]);
    const [scrappers, setScrappers] = React.useState<UniChatScrapper[]>([]);
    const [isOpenToLan, setIsOpenToLan] = React.useState(false);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { requiresRestart, showWidgetPreview } = React.useContext(AppContext);

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

    async function openQrCodeModal(url: string): Promise<void> {
        modalService.openModal({
            title: "Open on device",
            children: <QRCodeModal baseUrl={url} />
        });
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

            const isOpenToLan: boolean = await commandService.settingsGetItem(UniChatSettings.OPEN_TO_LAN);
            setIsOpenToLan(isOpenToLan);
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

                            {isOpenToLan && !requiresRestart ? (
                                <Menu>
                                    <Menu.Target>
                                        <Tooltip label="Open in device" position="left" withArrow>
                                            <Button data-tour="preview-open-in-browser">
                                                <i className="fas fa-globe" />
                                            </Button>
                                        </Tooltip>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<i className="fas fa-globe" />}
                                            onClick={() => openUrl(selectedWidgetUrl)}
                                        >
                                            Open in browser
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<i className="fas fa-mobile-alt" />}
                                            onClick={() => openQrCodeModal(selectedWidgetUrl)}
                                        >
                                            Open on device
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            ) : (
                                <Tooltip label="Open in browser" position="left" withArrow>
                                    <Button
                                        onClick={() => openUrl(selectedWidgetUrl)}
                                        data-tour="preview-open-in-browser"
                                    >
                                        <i className="fas fa-globe" />
                                    </Button>
                                </Tooltip>
                            )}
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
