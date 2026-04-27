/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import * as eventService from "@tauri-apps/api/event";
import clsx from "clsx";

import { Badge } from "unichat/components/Badge";
import { Button } from "unichat/components/Button";
import { TextInput } from "unichat/components/forms/TextInput";
import { Popover } from "unichat/components/Popover";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { notificationService } from "unichat/services/notificationService";
import { UniChatScraper } from "unichat/types";
import { IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { ScraperCardContainer, ScraperLabel } from "./styled";

interface Props {
    editingTooltip: PReact.ComponentChildren;
    scraper: UniChatScraper;
    validateUrl: (url: string) => Promise<string>;
}

const DEFAULT_EVENT: IPCStatusEvent = {
    type: "idle",
    scraperId: "youtube-chat",
    timestamp: Date.now()
};

const _logger = LoggerFactory.getLogger("ScraperCard");
export function ScraperCard(props: Props): PReact.ComponentChildren {
    const { editingTooltip, scraper, validateUrl } = props;

    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState<IPCStatusEvent | null>({ ...DEFAULT_EVENT, scraperId: scraper.id });

    const scraperIsRunning = useMemo(() => event != null && ["ready", "ping"].includes(event.type), [event]);
    const scraperIsLoading = useMemo(() => event == null, [event]);

    const inputRef = useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            if (inputRef.current != null) {
                const inputValue = await validateUrl(inputRef.current?.value ?? "");
                inputRef.current.value = inputValue;

                await commandService.setScraperWebviewUrl(scraper.id, inputValue);
                setEvent(null);
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
            await commandService.setScraperWebviewUrl(scraper.id, "about:blank");
            setEvent({ ...DEFAULT_EVENT, scraperId: scraper.id });
        } catch (err) {
            _logger.error("An error occurred while stopping the '{}' chat scraper: {}", scraper.name, err);
        } finally {
            setLoading(false);
        }
    }

    /* ============================================================================================================== */

    function handleStatusLabel(): string {
        if (loading || scraperIsLoading) {
            return "Starting...";
        } else {
            return scraperIsRunning ? "Stop" : "Start";
        }
    }

    function handleStatusIcon(): PReact.ComponentChildren {
        if (loading || scraperIsLoading) {
            return <i className="fas fa-spinner fa-spin" />;
        } else {
            return <i className={`fas fa-${scraperIsRunning ? "stop" : "play"}`} />;
        }
    }

    useEffect(() => {
        async function init(): Promise<void> {
            setLoading(true);

            try {
                const scraperStoredUrl = await commandService.getScraperStoredUrl(scraper.id);
                const scraperWebviewUrl = await commandService.getScraperWebviewUrl(scraper.id);

                if (scraperWebviewUrl === scraperStoredUrl) {
                    setEvent({ type: "ready", scraperId: scraper.id, timestamp: Date.now() });
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

    useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.scraperId !== scraper.id) {
                return;
            }

            if (["idle", "ready", "ping"].includes(payload.type)) {
                if (payload.type === "ready") {
                    notificationService.success({
                        title: `${scraper.name} scraper is ready`,
                        message: "The scraper has started successfully."
                    });
                }

                setEvent(payload);
            } else if (payload.type === "error") {
                notificationService.error({
                    title: `Error on ${scraper.name} scraper execution`,
                    message: payload.message ?? "An unknown error occurred in the scraper."
                });
            } else if (payload.type === "fatal") {
                setEvent({ ...DEFAULT_EVENT, scraperId: scraper.id });
                modalService.openModal({
                    size: "lg",
                    title: `An error occurred in the ${scraper.name} scraper initialization!`,
                    children: (
                        <div>
                            <pre>
                                {payload.message}
                                <br />
                                {payload.stack ?? "No stack trace available."}
                            </pre>
                        </div>
                    )
                });
            }
        });

        return () => {
            unListen.then((unListener) => unListener());
        };
    }, []);

    return (
        <ScraperCardContainer
            data-active={scraperIsRunning ? "true" : "false"}
            data-loading={loading || scraperIsLoading ? "true" : "false"}
        >
            <div className="scraper-badges-wrapper">
                {scraper.badges.map((badge, idx) => (
                    <Badge key={idx} bg="primary" style={{ marginRight: "4px" }}>
                        {badge.toUpperCase()}
                    </Badge>
                ))}
            </div>
            <div className="scraper-card-body">
                <Popover content={editingTooltip} placement="bottom-start" trigger="focus">
                    <TextInput
                        label={
                            <ScraperLabel>
                                <div
                                    className="scraper-icon"
                                    data-active={scraperIsRunning ? "true" : "false"}
                                    data-loading={loading || scraperIsLoading ? "true" : "false"}
                                >
                                    <i className={clsx(scraper.icon, "fa-fw")} />
                                </div>
                                {`${scraper.name} chat URL`}
                            </ScraperLabel>
                        }
                        placeholder={scraper.placeholderText}
                        inputRef={inputRef}
                        disabled={loading || scraperIsLoading || scraperIsRunning}
                        data-tour={`${scraper.id}--url-input`}
                    />
                </Popover>
                <Button
                    variant="secondary"
                    onClick={scraperIsRunning ? handleStop : handleStart}
                    disabled={loading || scraperIsLoading}
                >
                    {handleStatusIcon()}
                    {handleStatusLabel()}
                </Button>
            </div>
        </ScraperCardContainer>
    );
}
