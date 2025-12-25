/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, TextInput, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import * as eventService from "@tauri-apps/api/event";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { UniChatScrapper } from "unichat/types";
import { IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { ScrapperBadgesWrapper, ScrapperCardStyledContainer } from "./styled";

interface Props {
    editingTooltip: React.ReactNode;
    scrapper: UniChatScrapper;
    validateUrl: (url: string) => Promise<string>;
}

const DEFAULT_STATUS_EVENT: IPCStatusEvent = {
    type: "idle",
    scrapperId: "youtube-chat",
    timestamp: Date.now()
};

const _logger = LoggerFactory.getLogger(import.meta.url);
export function ScrapperCard(props: Props): React.ReactNode {
    const { editingTooltip, scrapper, validateUrl } = props;

    const [loading, setLoading] = React.useState(false);
    const [event, setEvent] = React.useState<IPCStatusEvent>({ ...DEFAULT_STATUS_EVENT, scrapperId: scrapper.id });

    const scrapperIsRunning = React.useMemo(() => event != null && ["ready", "ping"].includes(event.type), [event]);
    const scrapperIsStarting = React.useMemo(() => event == null, [event]);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const inputValue = await validateUrl(inputRef.current?.value ?? "");
            inputRef.current.value = inputValue;

            await commandService.setScrapperWebviewUrl(scrapper.id, inputValue);
            setEvent({ type: "ready", scrapperId: scrapper.id, timestamp: Date.now() });
        } catch (err) {
            _logger.error(`An error occurred while starting the ${scrapper.name} chat scrapper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await commandService.setScrapperWebviewUrl(scrapper.id, "about:blank");
            setEvent({ ...DEFAULT_STATUS_EVENT, scrapperId: scrapper.id });
        } catch (err) {
            _logger.error(`An error occurred while stopping the ${scrapper.name} chat scrapper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenScrapperWindow(): Promise<void> {
        await commandService.toggleScrapperWebview(scrapper.id);
    }

    /* ============================================================================================================== */

    function handleStatusLabel(): string {
        if (loading || scrapperIsStarting) {
            return "Starting";
        } else {
            return scrapperIsRunning ? "Stop" : "Start";
        }
    }

    function handleStatusIcon(): React.ReactNode {
        if (loading || scrapperIsStarting) {
            return <i className="fas fa-spinner fa-spin" />;
        } else {
            return scrapperIsRunning ? <i className="fas fa-stop" /> : <i className="fas fa-play" />;
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            setLoading(true);

            try {
                const scrapperStoredUrl = await commandService.getScrapperStoredUrl(scrapper.id);

                if (inputRef.current && !Strings.isNullOrEmpty(scrapperStoredUrl)) {
                    inputRef.current.value = scrapperStoredUrl;
                }
            } catch (err) {
                _logger.error("An error occurred while initializing the scrapper '{}' card", scrapper.id, err);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    React.useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.scrapperId !== scrapper.id) {
                return;
            }

            if (payload.type === "error") {
                notifications.show({
                    title: `Error on ${scrapper.name} scrapper execution`,
                    message: payload.message ?? "An unknown error occurred in the scrapper.",
                    color: "red",
                    icon: <i className="fas fa-times" />
                });
            }

            if (["idle", "ready", "ping"].includes(payload.type)) {
                setEvent(payload);
            } else if (payload.type === "fatal") {
                setEvent({ ...DEFAULT_STATUS_EVENT, scrapperId: scrapper.id });
                modals.open({
                    title: `An error occurred in the ${scrapper.name} scrapper initialization!`,
                    size: "lg",
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
            <ScrapperBadgesWrapper>
                {scrapper.badges.map((badge, idx) => (
                    <Badge key={idx} radius="xs" size="xs" style={{ marginRight: "4px" }}>
                        {badge}
                    </Badge>
                ))}
            </ScrapperBadgesWrapper>
            <ScrapperCardStyledContainer>
                <Tooltip
                    label={editingTooltip}
                    position="bottom-start"
                    color="gray"
                    events={{ hover: false, focus: true, touch: true }}
                    style={{ maxWidth: "407px", whiteSpace: "normal" }}
                >
                    <TextInput
                        size="sm"
                        label={`Scrapper: ${scrapper.name} chat URL`}
                        placeholder={scrapper.placeholderText}
                        ref={inputRef}
                        disabled={loading || scrapperIsRunning}
                        data-tour={`${scrapper.id}--url-input`}
                    />
                </Tooltip>
                <Button
                    size="sm"
                    color="gray"
                    leftSection={handleStatusIcon()}
                    onClick={scrapperIsRunning ? handleStop : handleStart}
                    disabled={loading}
                >
                    {handleStatusLabel()}
                </Button>
                {scrapperIsRunning && (
                    <Button size="sm" onClick={handleOpenScrapperWindow}>
                        <i className={scrapper.icon || "fas fa-square"} />
                    </Button>
                )}
            </ScrapperCardStyledContainer>
        </Card>
    );
}
