import React from "react";

import { Button, Card, DefaultMantineColor, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBolt, IconCheck, IconLoader, IconPlayerPlay, IconPlayerStopFilled } from "@tabler/icons-react";
import * as eventService from "@tauri-apps/api/event";

import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { storageService } from "unichat/services/storageService";
import { TWITCH_CHANNEL_NAME } from "unichat/utils/constants";
import { IPCTwitchEvents, IPCTwitchStatusEvent, TWITCH_EVENT_DESCRIPTION } from "unichat/utils/IPCTwitchEvents";
import { Strings } from "unichat/utils/Strings";

import { TwitchCardStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const DEFAULT_STATUS_EVENT: IPCTwitchStatusEvent = {
    type: "idle",
    timestamp: Date.now()
};

export function TwitchCard(_props: Props): React.ReactNode {
    const [loading, setLoading] = React.useState(true);
    const [event, setEvent] = React.useState<IPCTwitchStatusEvent>(DEFAULT_STATUS_EVENT);
    const [currentActiveUrl, setCurrentActiveUrl] = React.useState("about:blank");
    const [error, setError] = React.useState<string>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            let value = inputRef.current?.value ?? "";
            let channelName = inputRef.current?.value ?? "";

            if (value.startsWith("https://www.twitch.tv/")) {
                const parts = value.replace("https://www.twitch.tv/", "").split("/");

                if (parts.length !== 1 && parts.length !== 3) {
                    throw new Error("Invalid Twitch chat URL");
                }

                if (parts[0] === "popout") {
                    channelName = parts[1];
                } else {
                    channelName = parts[0];
                }
            }

            if (!Strings.isValidTwitchChannelName(channelName)) {
                throw new Error("Invalid Twitch chat URL");
            } else {
                value = `https://www.twitch.tv/popout/${channelName}/chat`;
                inputRef.current.value = value;
            }

            await storageService.setItem(TWITCH_CHANNEL_NAME, channelName);
            await commandService.twitch.setScrapperUrl(value);
            setCurrentActiveUrl(value);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else if (typeof err === "string") {
                setError(err);
            }

            loggerService.error("An error occurred while starting the Twitch chat scrapper: {}", err);
            notifications.show({ message: "An error occurred on save", color: "red" });
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await commandService.twitch.setScrapperUrl("about:blank");
            setCurrentActiveUrl("about:blank");
        } catch (err) {
            loggerService.error("An error occurred while stopping the Twitch chat scrapper: {}", err);
            notifications.show({ message: "An error occurred on save", color: "red" });
        } finally {
            setLoading(false);
        }
    }

    function handleStatusColor(): DefaultMantineColor {
        switch (event.type) {
            case "ping":
                return "green";
            case "ready":
                return "yellow";
            case "error":
                return "red";
            default:
                return "gray";
        }
    }

    function handleStatusLabel(): string {
        if (loading) {
            return "Starting";
        }

        if (inputRef.current?.value === currentActiveUrl) {
            return "Running";
        }

        switch (event.type) {
            case "idle":
                return "Start";
            default:
                return event.type.charAt(0).toUpperCase() + event.type.slice(1);
        }
    }

    function handleStatusIcon(): React.ReactNode {
        if (loading) {
            return <IconLoader size="20" />;
        }

        if (inputRef.current?.value === currentActiveUrl) {
            return <IconBolt size="20" />;
        }

        switch (event.type) {
            case "ready":
                return <IconCheck size="20" />;
            case "idle":
                return <IconPlayerPlay size="20" />;
            default:
                return null;
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            if (inputRef.current) {
                const channelName = await storageService.getItem<string>(TWITCH_CHANNEL_NAME);
                if (!Strings.isNullOrEmpty(channelName)) {
                    inputRef.current.value = "https://www.twitch.tv/popout/" + channelName + "/chat";
                }
            }

            const url = await commandService.twitch.getScrapperUrl();
            if (url == null || !url.startsWith("https://www.twitch.com/popout/")) {
                setCurrentActiveUrl("about:blank");
            } else {
                setCurrentActiveUrl(url);
            }

            setLoading(false);
        }

        init();
    }, []);

    React.useEffect(() => {
        const unlisten = eventService.listen<IPCTwitchStatusEvent>(IPCTwitchEvents.TWITCH_EVENT, ({ payload }) => {
            if (payload.type === "error") {
                notifications.show({ color: "red", title: "Twitch chat scrapper error", message: payload.message });
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
            unlisten.then(() => console.log(`Unsubscribed from '${IPCTwitchEvents.TWITCH_EVENT}' event`));
        };
    }, []);

    return (
        <Card withBorder shadow="xs">
            <TwitchCardStyledContainer>
                <TextInput
                    size="sm"
                    label="Scrapper: Twitch chat URL"
                    description="Enter the Twitch chat/stream URL or username to start the scrapper."
                    error={error}
                    placeholder="https://www.twitch.tv/popout/{USERNAME}/chat"
                    ref={inputRef}
                    disabled={loading || inputRef.current?.value === currentActiveUrl}
                />
                <Tooltip label={TWITCH_EVENT_DESCRIPTION[event.type]} position="left">
                    <Button
                        size="sm"
                        leftSection={handleStatusIcon()}
                        color={handleStatusColor()}
                        onClick={handleStart}
                        disabled={loading || inputRef.current?.value === currentActiveUrl}
                    >
                        {handleStatusLabel()}
                    </Button>
                </Tooltip>
                {inputRef.current?.value === currentActiveUrl && (
                    <Button size="sm" color="red" onClick={handleStop}>
                        <IconPlayerStopFilled size="20" />
                    </Button>
                )}
            </TwitchCardStyledContainer>
        </Card>
    );
}
