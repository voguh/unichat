/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as eventService from "@tauri-apps/api/event";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { modalService } from "unichat/services/modalService";
import { UniChatScraper } from "unichat/types";
import { IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { ScraperBadgesWrapper, ScraperCardStyledContainer } from "./styled";

interface Props {
    editingTooltip: React.ReactNode;
    scraper: UniChatScraper;
    validateUrl: (url: string) => Promise<string>;
}

const DEFAULT_STATUS_EVENT: IPCStatusEvent = {
    type: "idle",
    scraperId: "youtube-chat",
    timestamp: Date.now()
};

const _logger = LoggerFactory.getLogger(__filename);
export function ScraperCard(props: Props): React.ReactNode {
    const { editingTooltip, scraper, validateUrl } = props;

    const [loading, setLoading] = React.useState(false);
    const [event, setEvent] = React.useState<IPCStatusEvent>({ ...DEFAULT_STATUS_EVENT, scraperId: scraper.id });

    const scraperIsRunning = React.useMemo(() => event != null && ["ready", "ping"].includes(event.type), [event]);
    const scraperIsLoading = React.useMemo(() => event == null, [event]);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const inputValue = await validateUrl(inputRef.current?.value ?? "");
            inputRef.current.value = inputValue;

            await commandService.setScraperWebviewUrl(scraper.id, inputValue);
            setEvent(null);
        } catch (err) {
            _logger.error(`An error occurred while starting the ${scraper.name} chat scraper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await commandService.setScraperWebviewUrl(scraper.id, "about:blank");
            setEvent({ ...DEFAULT_STATUS_EVENT, scraperId: scraper.id });
        } catch (err) {
            _logger.error(`An error occurred while stopping the ${scraper.name} chat scraper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenScraperWindow(): Promise<void> {
        await commandService.toggleScraperWebview(scraper.id);
    }

    /* ============================================================================================================== */

    function handleStatusLabel(): string {
        if (loading || scraperIsLoading) {
            return "Starting...";
        } else {
            return scraperIsRunning ? "Stop" : "Start";
        }
    }

    function handleStatusIcon(): React.ReactNode {
        if (loading || scraperIsLoading) {
            return <i className="fas fa-spinner fa-spin" />;
        } else {
            return scraperIsRunning ? <i className="fas fa-stop" /> : <i className="fas fa-play" />;
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            setLoading(true);

            try {
                const scraperStoredUrl = await commandService.getScraperStoredUrl(scraper.id);
                const scraperWebviewUrl = await commandService.getScraperWebviewUrl(scraper.id);

                if (scraperWebviewUrl === scraperStoredUrl) {
                    setEvent({ type: "ready", scraperId: scraper.id, timestamp: Date.now() });
                }

                if (inputRef.current && !Strings.isNullOrEmpty(scraperStoredUrl)) {
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

    React.useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.scraperId !== scraper.id) {
                return;
            }

            if (["idle", "ready", "ping"].includes(payload.type)) {
                if (payload.type === "ready") {
                    notifications.show({
                        title: `${scraper.name} scraper is ready`,
                        message: "The scraper has started successfully.",
                        color: "green",
                        icon: <i className="fas fa-check" />
                    });
                }

                setEvent(payload);
            } else if (payload.type === "error") {
                notifications.show({
                    title: `Error on ${scraper.name} scraper execution`,
                    message: payload.message ?? "An unknown error occurred in the scraper.",
                    color: "red",
                    icon: <i className="fas fa-times" />
                });
            } else if (payload.type === "fatal") {
                setEvent({ ...DEFAULT_STATUS_EVENT, scraperId: scraper.id });
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
        <Card withBorder shadow="xs" style={{ position: "relative" }}>
            <ScraperBadgesWrapper>
                {scraper.badges.map((badge, idx) => (
                    <Badge key={idx} radius="xs" size="xs" style={{ marginRight: "4px" }}>
                        {badge}
                    </Badge>
                ))}
            </ScraperBadgesWrapper>
            <ScraperCardStyledContainer>
                <Tooltip
                    label={editingTooltip}
                    position="bottom-start"
                    color="gray"
                    events={{ hover: false, focus: true, touch: true }}
                    style={{ maxWidth: "407px", whiteSpace: "normal" }}
                >
                    <TextInput
                        size="sm"
                        label={`${scraper.name} chat URL`}
                        placeholder={scraper.placeholderText}
                        ref={inputRef}
                        disabled={loading || scraperIsLoading || scraperIsRunning}
                        data-tour={`${scraper.id}--url-input`}
                    />
                </Tooltip>
                <Button
                    size="sm"
                    color="gray"
                    leftSection={handleStatusIcon()}
                    onClick={scraperIsRunning ? handleStop : handleStart}
                    disabled={loading || scraperIsLoading}
                >
                    {handleStatusLabel()}
                </Button>
                {scraperIsRunning && (
                    <Button size="sm" onClick={handleOpenScraperWindow}>
                        <i className={Strings.isNullOrEmpty(scraper.icon) ? "fas fa-square" : scraper.icon} />
                    </Button>
                )}
            </ScraperCardStyledContainer>
        </Card>
    );
}
