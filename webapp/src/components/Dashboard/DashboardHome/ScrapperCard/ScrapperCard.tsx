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
import { notifications } from "@mantine/notifications";
import {
    IconBrandTwitch,
    IconBrandYoutube,
    IconLoader,
    IconPlayerPlay,
    IconPlayerStop,
    IconX
} from "@tabler/icons-react";
import * as eventService from "@tauri-apps/api/event";

import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { storageService } from "unichat/services/storageService";
import { TWITCH_CHANNEL_NAME_KEY, YOUTUBE_VIDEO_ID_KEY } from "unichat/utils/constants";
import { EVENT_DESCRIPTION as STATUS_EVENT_DESCRIPTION, IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCardStyledContainer } from "./styled";

interface Props {
    type: "youtube" | "twitch";
    validateUrl(url: string): [string, string];
    editingTooltip: React.ReactNode;
}

const DEFAULT_STATUS_EVENT: IPCStatusEvent = {
    type: "idle",
    platform: "youtube",
    timestamp: Date.now()
};

export function ScrapperCard({ type, validateUrl, editingTooltip }: Props): React.ReactNode {
    const displayName = type === "youtube" ? "YouTube" : "Twitch";
    const [loading, setLoading] = React.useState(true);
    const [event, setEvent] = React.useState<IPCStatusEvent>({ ...DEFAULT_STATUS_EVENT, platform: type });
    const [currentActiveUrl, setCurrentActiveUrl] = React.useState("about:blank");
    const [error, setError] = React.useState<string>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const [inputValue, storeValue] = validateUrl(inputRef.current?.value ?? "");
            inputRef.current.value = inputValue;

            if (type === "youtube") {
                await storageService.setItem(YOUTUBE_VIDEO_ID_KEY, storeValue);
                await commandService.youTube.setScrapperUrl(inputValue);
            } else if (type === "twitch") {
                await storageService.setItem(TWITCH_CHANNEL_NAME_KEY, storeValue);
                await commandService.twitch.setScrapperUrl(inputValue);
            }

            setCurrentActiveUrl(inputValue);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                notifications.show({ message: err.message, color: "red" });
            } else if (typeof err === "string") {
                setError(err);
                notifications.show({ message: err, color: "red" });
            }

            loggerService.error(`An error occurred while starting the ${displayName} chat scrapper: {}`, err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);

            if (type === "youtube") {
                await commandService.youTube.setScrapperUrl("about:blank");
            } else if (type === "twitch") {
                await commandService.twitch.setScrapperUrl("about:blank");
            }

            setCurrentActiveUrl("about:blank");
            setTimeout(() => setEvent({ ...DEFAULT_STATUS_EVENT, platform: type }), 500);
        } catch (err) {
            loggerService.error(`An error occurred while stopping the ${displayName} chat scrapper: {}`, err);
            notifications.show({ message: "An error occurred on save", color: "red" });
        } finally {
            setLoading(false);
        }
    }

    async function handleOpenPopout(): Promise<void> {
        await commandService.toggleWebview(`${type}-chat`);
    }

    /* ============================================================================================================== */

    function handlePlaceholderMessage(): string {
        if (type === "youtube") {
            return "https://www.youtube.com/live_chat?v={VIDEO_ID}";
        } else if (type === "twitch") {
            return "https://www.twitch.tv/popout/{CHANNEL_NAME}/chat";
        }

        return "";
    }

    function handleOpenChatPopoutIcon(): React.ReactNode {
        if (type === "youtube") {
            return <IconBrandYoutube size="20" />;
        } else if (type === "twitch") {
            return <IconBrandTwitch size="20" />;
        }

        return null;
    }

    function handleStatusLabel(): string {
        if (error != null) {
            return "Error";
        } else if (loading || (inputRef.current?.value === currentActiveUrl && event.type !== "ping")) {
            return "Starting";
        } else if (inputRef.current?.value === currentActiveUrl && event.type === "ping") {
            return "Stop";
        } else if (event.type === "idle") {
            return "Start";
        }

        return event.type.charAt(0).toUpperCase() + event.type.slice(1);
    }

    function handleStatusIcon(): React.ReactNode {
        if (error != null) {
            return <IconX size="20" />;
        } else if (loading || (inputRef.current?.value === currentActiveUrl && event.type !== "ping")) {
            return <IconLoader size="20" />;
        } else if (inputRef.current?.value === currentActiveUrl && event.type === "ping") {
            return <IconPlayerStop size="20" />;
        } else if (event.type === "idle") {
            return <IconPlayerPlay size="20" />;
        }

        return null;
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            if (type === "youtube") {
                if (inputRef.current) {
                    const videoId = await storageService.getItem<string>(YOUTUBE_VIDEO_ID_KEY);
                    if (!Strings.isNullOrEmpty(videoId)) {
                        inputRef.current.value = `https://www.youtube.com/live_chat?v=${videoId}`;
                    }
                }

                const url = await commandService.youTube.getScrapperUrl();
                if (url == null || !url.startsWith("https://www.youtube.com/live_chat")) {
                    setCurrentActiveUrl("about:blank");
                } else {
                    setCurrentActiveUrl(url);
                }
            } else if (type === "twitch") {
                if (inputRef.current) {
                    const channelName = await storageService.getItem<string>(TWITCH_CHANNEL_NAME_KEY);
                    if (!Strings.isNullOrEmpty(channelName)) {
                        inputRef.current.value = `https://www.twitch.tv/popout/${channelName}/chat`;
                    }
                }

                const url = await commandService.twitch.getScrapperUrl();
                if (url == null || !url.startsWith("https://www.twitch.tv/popout/")) {
                    setCurrentActiveUrl("about:blank");
                } else {
                    setCurrentActiveUrl(url);
                }
            }

            setLoading(false);
        }

        init();
    }, []);

    React.useEffect(() => {
        const unListen = eventService.listen<IPCStatusEvent>(IPCEvents.STATUS_EVENT, ({ payload }) => {
            if (payload.platform !== type) {
                return;
            }

            if (payload.type === "error") {
                const title = `${displayName} chat scrapper error`;
                notifications.show({ color: "red", title, message: payload.message });
            } else {
                setEvent((old) => {
                    if (old.timestamp < payload.timestamp) {
                        return payload;
                    }

                    return old;
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
                        placeholder={handlePlaceholderMessage()}
                        ref={inputRef}
                        disabled={loading || inputRef.current?.value === currentActiveUrl}
                        onChange={() => error != null && setError(null)}
                        data-tour={`${type}-chat-url-input`}
                    />
                </Tooltip>
                <Tooltip position="left" label={STATUS_EVENT_DESCRIPTION[event.type]}>
                    <Button
                        size="sm"
                        color="gray"
                        leftSection={handleStatusIcon()}
                        onClick={inputRef.current?.value === currentActiveUrl ? handleStop : handleStart}
                        disabled={loading || (inputRef.current?.value === currentActiveUrl && event.type !== "ping")}
                    >
                        {handleStatusLabel()}
                    </Button>
                </Tooltip>
                {inputRef.current?.value === currentActiveUrl && event.type !== "idle" && (
                    <Button size="sm" onClick={handleOpenPopout}>
                        {handleOpenChatPopoutIcon()}
                    </Button>
                )}
            </ScrapperCardStyledContainer>
        </Card>
    );
}
