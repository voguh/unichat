/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { openUrl } from "@tauri-apps/plugin-opener";

import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { Select } from "unichat/components/forms/Select";
import { Tooltip } from "unichat/components/Tooltip";
import { useScrapers } from "unichat/hooks/useScrapers";
import { useStorage } from "unichat/hooks/useStorage";
import { useWidgets } from "unichat/hooks/useWidgets";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { settingsService, UniChatSettingsKeys } from "unichat/services/settingsService";
import { StorageKeys } from "unichat/services/storageService";
import { UniChatScraper } from "unichat/types";
import { scraperPriority, WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { QRCodeModal } from "./QRCodeModal";
import { ScraperCard } from "./ScraperCard";
import { DashboardStyledContainer } from "./styled";

function sortScrapers(scrapers: UniChatScraper[]): UniChatScraper[] {
    return scrapers.sort((a, b) => {
        const pa = scraperPriority(a.id);
        const pb = scraperPriority(b.id);

        if (pa !== pb) {
            return pa - pb;
        }

        return a.name.localeCompare(b.name);
    });
}

const _logger = LoggerFactory.getLogger("Dashboard");
export function Dashboard(): PReact.ComponentChildren {
    const [selectedWidget, setSelectedWidget] = useState("default");
    const [isOpenToLan, setIsOpenToLan] = useState(false);
    const [showWidgetPreview, _setShowWidgetPreview] = useStorage(StorageKeys.SHOW_WIDGET_PREVIEW);

    const [scrapers, _reloadScrapers] = useScrapers(sortScrapers, []);
    const [widgets, reloadWidgets] = useWidgets(toWidgetOptionGroup, []);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    function mountEditingTooltip(message: string, availableUrls: string[]): PReact.ComponentChildren {
        // prettier-ignore
        return (
            <>
                {message}
                <br />
                <ul className="list-disc list-inside">
                    {availableUrls.map((url, idx) => (
                        <li key={idx}>{url}</li>
                    ))}
                </ul>
                <br />
                You can enter the URL with or without the <Badge>www.</Badge> prefix.
                <br />
                You can also include or omit the <Badge variant="success">https://</Badge> or <Badge variant="danger">http://</Badge> prefix.
            </>
        );
    }

    /* ====================================================================== */

    async function openQrCodeModal(url: string): Promise<void> {
        modalService.openModal({
            size: "sm",
            title: "Open on device",
            children: <QRCodeModal baseUrl={url} />
        });
    }

    /* ====================================================================== */

    async function handleOpenInBrowser(): Promise<void> {
        if (isOpenToLan) {
            openQrCodeModal(`${WIDGET_URL_PREFIX}/${selectedWidget}`);
        } else {
            try {
                const url = `${WIDGET_URL_PREFIX}/${selectedWidget}`;
                await openUrl(url);
            } catch (err) {
                _logger.error("Failed to open URL in browser", err);
            }
        }
    }

    /* ====================================================================== */

    async function reloadIframe(): Promise<void> {
        await reloadWidgets();

        if (iframeRef.current) {
            iframeRef.current.src = `${WIDGET_URL_PREFIX}/${selectedWidget}`;
        }
    }

    useEffect(() => {
        async function init(): Promise<void> {
            const defaultPreviewWidget = await settingsService.getItem(UniChatSettingsKeys.DEFAULT_PREVIEW_WIDGET);
            setSelectedWidget(defaultPreviewWidget);

            const isOpenToLan = await settingsService.getItem(UniChatSettingsKeys.OPEN_TO_LAN);
            setIsOpenToLan(isOpenToLan);
        }

        init();
    }, []);

    return (
        <>
            <DashboardStyledContainer>
                <div className="scrapers">
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
                            <div className="preview__header">
                                <Select
                                    options={widgets}
                                    onChange={(evt) => setSelectedWidget(evt.currentTarget.value)}
                                    value={selectedWidget}
                                    data-tour="widgets-selector"
                                />

                                <Tooltip content="Reload widget view" placement="left">
                                    <Button onClick={reloadIframe} data-tour="preview-reload">
                                        <i className="fas fa-redo" />
                                    </Button>
                                </Tooltip>

                                <Tooltip content={isOpenToLan ? "Open on device" : "Open in browser"} placement="left">
                                    <Button onClick={handleOpenInBrowser} data-tour="preview-open-in-browser">
                                        <i className="fas fa-globe" />
                                    </Button>
                                </Tooltip>
                            </div>

                            <div className="preview__iframe-wrapper">
                                <iframe
                                    ref={iframeRef}
                                    src={`${WIDGET_URL_PREFIX}/${selectedWidget}`}
                                    sandbox="allow-scripts"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="preview__disabled">
                            <div>
                                <div className="preview__disabled-icons">
                                    <i className="fas fa-desktop fa-3x" />
                                    <i className="fas fa-times fa-2x" />
                                </div>
                                <div className="preview__disabled-text">Widget preview is disabled.</div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardStyledContainer>
        </>
    );
}
