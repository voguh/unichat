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
import { useEffect, useRef, useState } from "preact/hooks";

import * as eventService from "@tauri-apps/api/event";

import { Badge } from "@voguh/unichat-ui/Badge";
import { Button } from "@voguh/unichat-ui/Button";
import { TextInput } from "@voguh/unichat-ui/forms/TextInput";
import { ScrollableView } from "@voguh/unichat-ui/ScrollableView";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { settingsService, UniChatSettingsKeys } from "unichat/services/settingsService";
import type { UniChatScraper } from "unichat/types";
import { IPCEvents, type IPCStatusEvent, ScraperStatus } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import styles from "./styles.module.css";

interface Props {
    editingTooltip: PReact.ComponentChildren;
    scraper: UniChatScraper;
    validateUrl: (url: string) => Promise<string>;
}

const _logger = LoggerFactory.getLogger("ScraperCard");
export function ScraperCard(props: Props): PReact.ComponentChildren {
    const { editingTooltip, scraper, validateUrl } = props;

    const [loading, setLoading] = useState(false);
    const [showOpenWebviewButton, setShowOpenWebviewButton] = useState(false);
    const [scraperIsRunning, setScraperIsRunning] = useState(false);
    const [scraperIsLoading, setScraperIsLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            if (inputRef.current != null) {
                const inputValue = await validateUrl(inputRef.current.value);
                inputRef.current.value = inputValue;

                await commandService.startScraper(scraper.id, inputValue);
                setScraperIsLoading(true);
            }
        } catch (err) {
            _logger.error("An error occurred while starting the '{}' chat scraper: {}", scraper.name, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await commandService.stopScraper(scraper.id);
            setScraperIsRunning(false);
        } catch (err) {
            _logger.error("An error occurred while stopping the '{}' chat scraper: {}", scraper.name, err);
        } finally {
            setLoading(false);
        }
    }

    /* ====================================================================== */

    function handleStatusLabel(): string {
        if (loading || scraperIsLoading) {
            return "Starting...";
        } else if (scraperIsRunning) {
            return "Stop";
        } else {
            return "Start";
        }
    }

    function handleStatusIcon(): PReact.ComponentChildren {
        if (loading || scraperIsLoading) {
            return <i className="fas fa-spinner fa-spin" />;
        } else if (scraperIsRunning) {
            return <i className="fas fa-stop" />;
        } else {
            return <i className="fas fa-play" />;
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        async function init(): Promise<void> {
            setLoading(true);

            try {
                const showWebviewButton = await settingsService.getItem(UniChatSettingsKeys.OPEN_SCRAPER_WEBVIEW);
                setShowOpenWebviewButton(showWebviewButton);

                const scraperStoredUrl = await commandService.getScraperStoredUrl(scraper.id);
                const scraperWebviewUrl = await commandService.getScraperWebviewUrl(scraper.id);

                if (scraperWebviewUrl === scraperStoredUrl) {
                    setScraperIsRunning(true);
                }

                if (inputRef.current != null && !Strings.isNullOrEmpty(scraperStoredUrl)) {
                    inputRef.current.value = scraperStoredUrl;
                }
            } catch (err) {
                _logger.error("An error occurred while initializing the scraper '{}' card", scraper.id, err);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
    useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.scraperId !== scraper.id) {
                return;
            }

            if (payload.type === ScraperStatus.READY) {
                notificationService.success({
                    title: `${scraper.name} scraper is ready`,
                    message: "The scraper has started successfully."
                });

                setScraperIsLoading(false);
                setScraperIsRunning(true);
            } else if (payload.type === ScraperStatus.ERROR) {
                notificationService.error({
                    title: `Error on ${scraper.name} scraper execution`,
                    message: payload.message ?? "An unknown error occurred in the scraper."
                });
            } else if (payload.type === ScraperStatus.FATAL) {
                setScraperIsLoading(false);
                setScraperIsRunning(false);
                modalService.openModal({
                    size: "lg",
                    title: `An error occurred in the ${scraper.name} scraper initialization!`,
                    children: (
                        <ScrollableView rootProps={{ className: styles.errorDetails }}>
                            <pre>
                                {payload.message}
                                <br />
                                {payload.stack ?? "No stack trace available."}
                            </pre>
                        </ScrollableView>
                    )
                });
            }
        });

        return () => {
            unListen.then((unListener) => unListener());
        };
    }, []);

    return (
        <div
            className={styles.root}
            data-active={String(scraperIsRunning)}
            data-loading={String(loading || scraperIsLoading)}
        >
            <div className="badges">
                {scraper.badges.map((badge) => (
                    <Badge key={badge} variant="secondary">
                        {badge.toUpperCase()}
                    </Badge>
                ))}
            </div>
            <div className="body">
                <Tooltip placement="bottom-start" content={<div className={styles.tooltip}>{editingTooltip}</div>}>
                    <div data-tour={`${scraper.id}--url-input`}>
                        <TextInput
                            label={
                                <div>
                                    <div
                                        data-active={String(scraperIsRunning)}
                                        data-loading={String(loading || scraperIsLoading)}
                                    >
                                        {scraper.icon.startsWith("data:") ? (
                                            <img src={scraper.icon} />
                                        ) : (
                                            <i className={scraper.icon} />
                                        )}
                                    </div>
                                    {`${scraper.name} chat URL`}
                                </div>
                            }
                            placeholder={scraper.placeholderText}
                            ref={inputRef}
                            disabled={loading || scraperIsLoading || scraperIsRunning}
                        />
                    </div>
                </Tooltip>
                <Button
                    variant="secondary"
                    onClick={scraperIsRunning ? handleStop : handleStart}
                    disabled={loading || scraperIsLoading}
                >
                    {handleStatusIcon()}
                    {handleStatusLabel()}
                </Button>
                {(showOpenWebviewButton || __IS_DEV__) && (
                    <Button
                        variant="default"
                        onClick={() => commandService.toggleScraperWebview(scraper.id)}
                        disabled={loading || scraperIsLoading || !scraperIsRunning}
                        className="icon-button"
                    >
                        <i className="fas fa-window-restore" />
                    </Button>
                )}
            </div>
        </div>
    );
}
