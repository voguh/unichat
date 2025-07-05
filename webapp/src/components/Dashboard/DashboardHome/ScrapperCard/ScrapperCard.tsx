/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from "react";

import { Button, Card, DefaultMantineColor, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
    IconBrandTwitch,
    IconBrandYoutube,
    IconLoader,
    IconPlayerPlayFilled,
    IconPlayerStopFilled
} from "@tabler/icons-react";
import * as eventService from "@tauri-apps/api/event";

import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { storageService } from "unichat/services/storageService";
import { TWITCH_CHANNEL_NAME, YOUTUBE_CHAT_URL_KEY } from "unichat/utils/constants";
import { EVENT_DESCRIPTION as STATUS_EVENT_DESCRIPTION, IPCEvents, IPCStatusEvent } from "unichat/utils/IPCStatusEvent";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCardStyledContainer } from "./styled";

interface Props {
    type: "youtube" | "twitch";
    validateUrl(url: string): [string, string];
}

const DEFAULT_STATUS_EVENT: IPCStatusEvent = {
    type: "idle",
    platform: "youtube",
    timestamp: Date.now()
};

export function ScrapperCard({ type, validateUrl }: Props): React.ReactNode {
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
                await storageService.setItem(YOUTUBE_CHAT_URL_KEY, storeValue);
                await commandService.youTube.setScrapperUrl(inputValue);
            } else if (type === "twitch") {
                await storageService.setItem(TWITCH_CHANNEL_NAME, storeValue);
                await commandService.twitch.setScrapperUrl(inputValue);
            }

            setCurrentActiveUrl(inputValue);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else if (typeof err === "string") {
                setError(err);
            }

            loggerService.error(`An error occurred while starting the ${displayName} chat scrapper: {}`, err);
            notifications.show({ message: "An error occurred on save", color: "red" });
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
        } catch (err) {
            loggerService.error(`An error occurred while stopping the ${displayName} chat scrapper: {}`, err);
            notifications.show({ message: "An error occurred on save", color: "red" });
        } finally {
            setLoading(false);
        }
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

    function handleStatusColor(): DefaultMantineColor {
        if (loading) {
            return "blue";
        } else if (inputRef.current?.value === currentActiveUrl && event.type === "ping") {
            return "red.8";
        }

        return "gray";
    }

    function handleStatusLabel(): string {
        if (loading) {
            return "Starting";
        } else if (inputRef.current?.value === currentActiveUrl && event.type === "ping") {
            return "Stop";
        } else if (event.type === "idle") {
            return "Start";
        }

        return event.type.charAt(0).toUpperCase() + event.type.slice(1);
    }

    function handleStatusIcon(): React.ReactNode {
        if (loading) {
            return <IconLoader size="20" />;
        } else if (inputRef.current?.value === currentActiveUrl && event.type === "ping") {
            return <IconPlayerStopFilled size="20" />;
        } else if (event.type === "idle") {
            return <IconPlayerPlayFilled size="20" />;
        }

        return null;
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            if (type === "youtube") {
                if (inputRef.current) {
                    const url = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY);
                    if (!Strings.isNullOrEmpty(url)) {
                        inputRef.current.value = url;
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
                    const channelName = await storageService.getItem<string>(TWITCH_CHANNEL_NAME);
                    if (!Strings.isNullOrEmpty(channelName)) {
                        inputRef.current.value = "https://www.twitch.tv/popout/" + channelName + "/chat";
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
                <TextInput
                    size="sm"
                    label={`Scrapper: ${displayName} chat URL`}
                    error={error}
                    placeholder={handlePlaceholderMessage()}
                    ref={inputRef}
                    disabled={loading || inputRef.current?.value === currentActiveUrl}
                />
                <Tooltip position="left" label={STATUS_EVENT_DESCRIPTION[event.type]}>
                    <Button
                        size="sm"
                        leftSection={handleStatusIcon()}
                        color={handleStatusColor()}
                        onClick={inputRef.current?.value === currentActiveUrl ? handleStop : handleStart}
                        disabled={
                            loading ||
                            error != null ||
                            (inputRef.current?.value === currentActiveUrl && event.type !== "ping")
                        }
                    >
                        {handleStatusLabel()}
                    </Button>
                </Tooltip>
                {inputRef.current?.value === currentActiveUrl && event.type === "ping" && (
                    <Button size="sm">{handleOpenChatPopoutIcon()}</Button>
                )}
            </ScrapperCardStyledContainer>
        </Card>
    );
}
