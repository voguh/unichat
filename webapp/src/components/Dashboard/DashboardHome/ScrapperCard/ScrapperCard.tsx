import React from "react";

import { Button, Card, DefaultMantineColor, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBolt, IconCheck, IconLoader, IconPlayerPlay, IconPlayerStopFilled } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import * as eventService from "@tauri-apps/api/event";

import { storageService } from "unichat/services/storageService";
import { YOUTUBE_CHAT_URL_KEY } from "unichat/utils/constants";
import { IPCYoutubeEvents, IPCYouTubeStatusEvent, YOUTUBE_EVENT_DESCRIPTION } from "unichat/utils/IPCYoutubeEvents";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCardStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const DEFAULT_STATUS_EVENT: IPCYouTubeStatusEvent = {
    type: "idle",
    timestamp: Date.now()
};

export function ScrapperCard(_props: Props): React.ReactNode {
    const [loading, setLoading] = React.useState<boolean>(true);
    const [event, setEvent] = React.useState<IPCYouTubeStatusEvent>(DEFAULT_STATUS_EVENT);
    const [currentActiveUrl, setCurrentActiveUrl] = React.useState<string>("");

    const inputRef = React.useRef<HTMLInputElement>(null);

    async function handleStart(): Promise<void> {
        try {
            setLoading(true);
            const value = inputRef.current?.value ?? "";
            if (!Strings.isValidYouTubeChatUrl(value)) {
                throw new Error("Invalid YouTube chat URL");
            }

            await storageService.setItem(YOUTUBE_CHAT_URL_KEY, value);
            await invoke("update_webview_url", { label: "youtube-chat", url: value });
            setCurrentActiveUrl(value);
        } catch (err) {
            console.error(err);
            notifications.show({ message: "An error occurred on save", color: "red" });
        } finally {
            setLoading(false);
        }
    }

    async function handleStop(): Promise<void> {
        try {
            setLoading(true);
            await storageService.setItem(YOUTUBE_CHAT_URL_KEY, "about:blank");
            await invoke("update_webview_url", { label: "youtube-chat", url: "about:blank" });
            setCurrentActiveUrl(null);
        } catch (err) {
            console.error(err);
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
                const urlKey = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY);
                inputRef.current.value = (urlKey ?? "").replace("about:blank", "");
            }

            await new Promise((resolve) => setTimeout(resolve, 4000)); // Delay to await some event
            setLoading(false);
        }

        init();
    }, []);

    React.useEffect(() => {
        const unlisten = eventService.listen<IPCYouTubeStatusEvent>(IPCYoutubeEvents.YOUTUBE_EVENT, ({ payload }) => {
            if (payload.type === "error") {
                notifications.show({ color: "red", title: "YouTube chat scrapper error", message: payload.message });
            } else {
                setEvent((old) => {
                    if (old.timestamp < payload.timestamp) {
                        if (payload.type === "ping") {
                            setCurrentActiveUrl(inputRef.current?.value ?? "");
                        }

                        return payload;
                    }

                    return old;
                });
            }
        });

        return () => {
            unlisten.then(() => console.log(`Unsubscribed from '${IPCYoutubeEvents.YOUTUBE_EVENT}' event`));
        };
    }, []);

    return (
        <Card withBorder shadow="xs">
            <ScrapperCardStyledContainer>
                <TextInput
                    size="sm"
                    label="Scrapper: YouTube chat URL"
                    placeholder="https://www.youtube.com/live_chat?v={VIDEO_ID}"
                    ref={inputRef}
                    disabled={inputRef.current?.value === currentActiveUrl}
                />
                <Tooltip label={YOUTUBE_EVENT_DESCRIPTION[event.type]} position="left">
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
            </ScrapperCardStyledContainer>
        </Card>
    );
}
