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
import { IconAppWindow, IconLoader, IconPlayerPlay, IconPlayerStop, IconX } from "@tabler/icons-react";
import * as eventService from "@tauri-apps/api/event";

import { commandService } from "unichat/services/commandService";
import { LoggerFactory } from "unichat/services/loggerService";
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
    const [currentActiveUrl, setCurrentActiveUrl] = React.useState("about:blank");
    const [error, setError] = React.useState<string>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const inputValue = validateUrl(inputRef.current?.value ?? "");
            inputRef.current.value = inputValue;

            await commandService.setScrapperWebviewUrl(scrapperId, inputValue);
            setCurrentActiveUrl(inputValue);
            setError(null);
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
            setCurrentActiveUrl("about:blank");
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
        if (error != null) {
            return "Error";
        } else if (loading) {
            return "Starting";
        } else if (inputRef.current?.value === currentActiveUrl) {
            return "Stop";
        } else if (inputRef.current?.value !== currentActiveUrl) {
            return "Start";
        }

        return event.type.charAt(0).toUpperCase() + event.type.slice(1);
    }

    function handleStatusIcon(): React.ReactNode {
        if (error != null) {
            return <IconX size="20" />;
        } else if (loading) {
            return <IconLoader size="20" />;
        } else if (inputRef.current?.value === currentActiveUrl) {
            return <IconPlayerStop size="20" />;
        } else if (inputRef.current?.value !== currentActiveUrl) {
            return <IconPlayerPlay size="20" />;
        }

        return null;
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            try {
                setLoading(true);
                const activeUrl = await commandService.getScrapperWebviewUrl(scrapperId);
                setCurrentActiveUrl(activeUrl);
                if (inputRef.current) {
                    inputRef.current.value = activeUrl;
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

            setEvent((old) => {
                if (old.timestamp < payload.timestamp) {
                    return payload;
                }

                return old;
            });
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
                        disabled={loading}
                        onChange={() => error != null && setError(null)}
                        data-tour={`${scrapperId}-chat-url-input`}
                    />
                </Tooltip>
                <Button
                    size="sm"
                    color="gray"
                    leftSection={handleStatusIcon()}
                    onClick={inputRef.current?.value === currentActiveUrl ? handleStop : handleStart}
                    disabled={loading}
                >
                    {handleStatusLabel()}
                </Button>
                {inputRef.current?.value === currentActiveUrl && (
                    <Button size="sm" onClick={handleOpenScrapperWindow}>
                        {handleScrapperIcon()}
                    </Button>
                )}
            </ScrapperCardStyledContainer>
        </Card>
    );
}
