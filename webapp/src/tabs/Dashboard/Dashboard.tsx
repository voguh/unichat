/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import ListGroup from "react-bootstrap/ListGroup";

import { GroupBase, Option, Select } from "unichat/components/forms/Select";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { AppContext } from "unichat/contexts/AppContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { UniChatScraper } from "unichat/types";
import { scraperPriority, UniChatSettings, WIDGET_URL_PREFIX } from "unichat/utils/constants";

import { QRCodeModal } from "./QRCodeModal";
import { ScraperCard } from "./ScraperCard";
import { DashboardStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger("Dashboard");
export function Dashboard(_props: Props): React.ReactNode {
    const [selectedWidget, setSelectedWidget] = React.useState("default");
    const [widgets, setWidgets] = React.useState<GroupBase<Option>[]>([]);
    const [scrapers, setScrapers] = React.useState<UniChatScraper[]>([]);
    const [isOpenToLan, setIsOpenToLan] = React.useState(false);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { requiresRestart, showWidgetPreview } = React.useContext(AppContext);

    function mountEditingTooltip(message: string, availableUrls: string[]): React.ReactNode {
        // prettier-ignore
        return (
            <>
                {message}
                <br />
                <ListGroup style={{textAlign: "left"}}>
                    {availableUrls.map((url, idx) => <ListGroup.Item key={idx}>{url}</ListGroup.Item>)}
                </ListGroup>
                <br />
                You can enter the URL with or without the <Badge>www.</Badge> prefix.
                <br />
                You can also include or omit the <Badge bg="success">https://</Badge> or <Badge bg="danger">http://</Badge> prefix.
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

    function handleSelectWidget(option: Option | null): void {
        if (option) {
            setSelectedWidget(option.value);
        }
    }

    async function handleFetchWidgets(): Promise<GroupBase<Option>[]> {
        const widgets = await commandService.listWidgets();

        return widgets.map((groupItem) => ({
            label: groupItem.group,
            options: groupItem.items
                .filter((item) => item !== "example")
                .sort((a, b) => a.localeCompare(b))
                .map((widget) => ({ label: widget, value: widget }))
        }));
    }

    async function reloadIframe(): Promise<void> {
        await commandService.reloadWidgets();
        const widgets = await handleFetchWidgets();
        setWidgets(widgets);

        if (iframeRef.current) {
            iframeRef.current.src = `${WIDGET_URL_PREFIX}/${selectedWidget}`;
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await handleFetchWidgets();
            setWidgets(widgets);

            // eslint-disable-next-line prettier/prettier
            const defaultPreviewWidget: string = await commandService.settingsGetItem(UniChatSettings.DEFAULT_PREVIEW_WIDGET);
            setSelectedWidget(defaultPreviewWidget);

            const scrapers = await commandService.getScrapers();
            const sortedScrapers = scrapers.sort((a, b) => {
                const pa = scraperPriority(a.id);
                const pb = scraperPriority(b.id);

                if (pa !== pb) {
                    return pa - pb;
                }

                return a.name.localeCompare(b.name);
            });
            setScrapers(sortedScrapers);

            const isOpenToLan: boolean = await commandService.settingsGetItem(UniChatSettings.OPEN_TO_LAN);
            setIsOpenToLan(isOpenToLan);
        }

        init();
    }, []);

    return (
        <DashboardStyledContainer>
            <div className="fields">
                {scrapers.map((s) => (
                    <ScraperCard
                        key={s.id}
                        editingTooltip={mountEditingTooltip(s.editingTooltipMessage, s.editingTooltipUrls)}
                        validateUrl={(value) => commandService.validateScraperUrl(s.id, value)}
                        scraper={s}
                    />
                ))}
            </div>
            <div className="preview">
                {showWidgetPreview ? (
                    <>
                        <Card className="preview-header">
                            <div className="preview-header-widget-selector">
                                <Select
                                    value={widgets
                                        .flatMap((widget) => widget.options)
                                        .find((option) => option.value === selectedWidget)}
                                    options={widgets}
                                    onChange={handleSelectWidget}
                                    data-tour="widgets-selector"
                                />
                            </div>

                            <Tooltip content="Reload widget view" placement="left">
                                <Button onClick={reloadIframe} data-tour="preview-reload">
                                    <i className="fas fa-redo" />
                                </Button>
                            </Tooltip>

                            {isOpenToLan && !requiresRestart ? (
                                <Dropdown>
                                    <Tooltip content="Open in device" placement="left">
                                        <Dropdown.Toggle variant="dark">
                                            <i className="fas fa-globe" />
                                        </Dropdown.Toggle>
                                    </Tooltip>

                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            onClick={() => openUrl(`${WIDGET_URL_PREFIX}/${selectedWidget}`)}
                                        >
                                            <i className="fas fa-globe" /> Open in browser
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() => openQrCodeModal(`${WIDGET_URL_PREFIX}/${selectedWidget}`)}
                                        >
                                            <i className="fas fa-mobile-alt" />
                                            Open on device
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : (
                                <Tooltip content="Open in browser" placement="left">
                                    <Button
                                        onClick={() => openUrl(`${WIDGET_URL_PREFIX}/${selectedWidget}`)}
                                        data-tour="preview-open-in-browser"
                                    >
                                        <i className="fas fa-globe" />
                                    </Button>
                                </Tooltip>
                            )}
                        </Card>
                        <div className="iframe-wrapper">
                            <iframe
                                ref={iframeRef}
                                src={`${WIDGET_URL_PREFIX}/${selectedWidget}`}
                                sandbox="allow-scripts"
                            />
                        </div>
                    </>
                ) : (
                    <div className="iframe-placeholder">Widget preview is disabled.</div>
                )}
            </div>
        </DashboardStyledContainer>
    );
}

export function DashboardLeftSection(_props: Props): React.ReactNode {
    const { showWidgetPreview, setShowWidgetPreview } = React.useContext(AppContext);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    return (
        <>
            <Tooltip content="Clear chat history" placement="right">
                <Button size="sm" onClick={handleClearChat} data-tour="clear-chat">
                    <i className="fas fa-eraser" />
                </Button>
            </Tooltip>
            <Tooltip content="Open user widgets folder" placement="right">
                <Button onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)} data-tour="user-widgets-directory">
                    <i className="fas fa-folder" />
                </Button>
            </Tooltip>
            <Tooltip content="Toggle widget preview" placement="right">
                <Button
                    onClick={() => setShowWidgetPreview((old) => !old)}
                    variant={showWidgetPreview ? "primary" : "dark"}
                    data-tour="toggle-widget-preview"
                >
                    {showWidgetPreview ? <i className="fas fa-eye" /> : <i className="fas fa-eye-slash" />}
                </Button>
            </Tooltip>
        </>
    );
}
