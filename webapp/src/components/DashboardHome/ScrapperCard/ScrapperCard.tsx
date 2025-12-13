/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, Card, TextInput, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconAppWindow, IconLoader, IconPlayerPlay, IconPlayerStop, IconX } from "@tabler/icons-react";
import * as eventService from "@tauri-apps/api/event";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";

import { ScrapperCardStyledContainer } from "./styled";

interface Props {
    displayName: string;
    scrapperId: string;
    validateUrl(url: string): string;
    placeholderText?: string;
    editingTooltip?: React.ReactNode;
    scrapperIcon?: React.ReactNode;
}

const DEFAULT_STATUS_EVENT: IPCStatusEvent = {
    type: "idle",
    scrapperId: "youtube-chat",
    timestamp: Date.now()
};

const _logger = LoggerFactory.getLogger(import.meta.url);
export function ScrapperCard(props: Props): React.ReactNode {
    const { displayName, scrapperId, validateUrl, editingTooltip, placeholderText, scrapperIcon } = props;

    const [loading, setLoading] = React.useState(false);
    const [event, setEvent] = React.useState<IPCStatusEvent>({ ...DEFAULT_STATUS_EVENT, scrapperId });

    const scrapperIsRunning = React.useMemo(() => event != null && ["ready", "ping"].includes(event.type), [event]);
    const scrapperIsStarting = React.useMemo(() => event == null, [event]);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const inputValue = validateUrl(inputRef.current?.value ?? "");
            inputRef.current.value = inputValue;

            await commandService.setScrapperWebviewUrl(scrapperId, inputValue);
            setEvent({ type: "ready", scrapperId, timestamp: Date.now() });
        } catch (err) {
            _logger.error(`An error occurred while starting the ${displayName} chat scrapper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await commandService.setScrapperWebviewUrl(scrapperId, "about:blank");
            setEvent({ ...DEFAULT_STATUS_EVENT, scrapperId });
        } catch (err) {
            _logger.error(`An error occurred while stopping the ${displayName} chat scrapper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenScrapperWindow(): Promise<void> {
        await commandService.toggleScrapperWebview(scrapperId);
    }

    /* ============================================================================================================== */

    function handleScrapperIcon(): React.ReactNode {
        if (scrapperIcon != null) {
            return scrapperIcon;
        }

        return <IconAppWindow size="20" />;
    }

    function handleStatusLabel(): string {
        if (loading || scrapperIsStarting) {
            return "Starting";
        } else {
            return scrapperIsRunning ? "Stop" : "Start";
        }
    }

    function handleStatusIcon(): React.ReactNode {
        if (loading || scrapperIsStarting) {
            return <IconLoader size="20" />;
        } else {
            return scrapperIsRunning ? <IconPlayerStop size="20" /> : <IconPlayerPlay size="20" />;
        }
    }

    React.useEffect(() => {
        async function handleUpdateInputValue(): Promise<void> {
            const activeUrl = await commandService.getScrapperWebviewUrl(scrapperId);

            if (inputRef.current && inputRef.current.value !== activeUrl) {
                inputRef.current.value = activeUrl;
            }
        }

        if (scrapperIsRunning) {
            handleUpdateInputValue();
        }
    }, [scrapperIsRunning]);

    React.useEffect(() => {
        async function init(): Promise<void> {
            setLoading(true);

            try {
                const scrapperStoredUrl = await commandService.storeGetItem<string>(`scrapper::${scrapperId}::url`);

                if (inputRef.current) {
                    inputRef.current.value = scrapperStoredUrl;
                }
            } catch (err) {
                _logger.error("An error occurred while initializing the scrapper '{}' card", scrapperId, err);
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    React.useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.scrapperId !== scrapperId) {
                return;
            }

            if (payload.type === "error") {
                notifications.show({
                    title: `Error on ${displayName} Scrapper execution`,
                    message: payload.message ?? "An unknown error occurred in the scrapper.",
                    color: "red",
                    icon: <IconX />
                });
            }

            if (["idle", "ready", "ping"].includes(payload.type)) {
                setEvent(payload);
            } else if (payload.type === "fatal") {
                setEvent({ ...DEFAULT_STATUS_EVENT, scrapperId });
                modals.open({
                    title: `An error occurred in the ${displayName} scrapper initialization!`,
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
        <Card withBorder shadow="xs">
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
                        label={`Scrapper: ${displayName} chat URL`}
                        placeholder={placeholderText}
                        ref={inputRef}
                        disabled={loading || scrapperIsRunning}
                        data-tour={`${scrapperId}-chat-url-input`}
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
                        {handleScrapperIcon()}
                    </Button>
                )}
            </ScrapperCardStyledContainer>
        </Card>
    );
}
