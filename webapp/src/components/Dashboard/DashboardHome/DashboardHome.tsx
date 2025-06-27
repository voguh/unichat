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

import { Badge, Button, Card, DefaultMantineColor, Select, Text, TextInput, Tooltip } from "@mantine/core";
import { FormValidateInput, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFolderFilled, IconReload, IconWorld } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import * as event from "@tauri-apps/api/event";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { storageService } from "unichat/services/storageService";
import { YOUTUBE_CHAT_URL_KEY } from "unichat/utils/constants";
import {
    IPCYoutubeEvents,
    IPCYouTubeStatusEvent,
    IPCYouTubeStatusPingEvent,
    YOUTUBE_EVENT_DESCRIPTION
} from "unichat/utils/IPCYoutubeEvents";
import { Strings } from "unichat/utils/Strings";

import { DashboardHomeStyledContainer } from "./styled";

interface FormData {
    youtubeChatUrl: string;
}

const initialValues: FormData = {
    youtubeChatUrl: ""
};

const validate: FormValidateInput<FormData> = {
    youtubeChatUrl(value, _values, _path) {
        if (!Strings.isValidYouTubeChatUrl(value)) {
            return "Invalid YouTube chat URL";
        }

        return null;
    }
};

const DEFAULT_STATUS_EVENT: IPCYouTubeStatusEvent = {
    type: "idle",
    timestamp: Date.now()
};

export function DashboardHome(): React.ReactNode {
    const [statusEvent, setStatusEvent] = React.useState<IPCYouTubeStatusEvent>(DEFAULT_STATUS_EVENT);
    const [selectedWidget, setSelectedWidget] = React.useState("default");
    const [widgets, setWidgets] = React.useState<string[]>([]);

    const [savingStatus, setSavingStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

    const { getInputProps, key, onSubmit, setFieldValue } = useForm({ initialValues, validate });

    const { metadata } = React.useContext(AppContext);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function onChangeWidget(widgetName: string): void {
        setSelectedWidget(widgetName);
    }

    async function reloadIframe(): Promise<void> {
        const widgets = await invoke<string[]>("list_widgets");
        setWidgets(widgets);

        iframeRef.current?.contentWindow.location.reload();
    }

    async function handleSubmit(formData: FormData): Promise<void> {
        try {
            setSavingStatus("saving");
            if (!Strings.isValidYouTubeChatUrl(formData.youtubeChatUrl)) {
                formData.youtubeChatUrl = "about:blank";
            }

            await storageService.setItem(YOUTUBE_CHAT_URL_KEY, formData.youtubeChatUrl);
            await invoke("update_webview_url", { label: "youtube-chat", url: formData.youtubeChatUrl });
            setSavingStatus("saved");
            notifications.show({ message: "Successfully saved" });
        } catch (err) {
            console.error(err);
            setSavingStatus("error");
            notifications.show({ message: "An error occurred on save", color: "red" });
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const youtubeChatUrl = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY);

            const widgets = await invoke<string[]>("list_widgets");
            setWidgets(widgets);

            setFieldValue("youtubeChatUrl", youtubeChatUrl || "about:blank");
        }

        init();
    }, []);

    function handleStatus(): void {
        setStatusEvent((statusEvent) => {
            if (statusEvent.type === "ping" && Date.now() - statusEvent.timestamp > 5000) {
                return { type: "error", error: null, timestamp: Date.now() };
            }

            return statusEvent;
        });
    }

    function handleStatusColor(eventType: IPCYouTubeStatusEvent["type"]): DefaultMantineColor {
        switch (eventType) {
            case "ping":
                return "green";
            case "ready":
                return "orange";
            case "installed":
                return "yellow";
            case "error":
                return "red";
            default:
                return "gray";
        }
    }

    React.useEffect(() => {
        const interval = setInterval(handleStatus, 5000);
        const unlisten = event.listen<IPCYouTubeStatusEvent>(IPCYoutubeEvents.YOUTUBE_EVENT, ({ payload }) => {
            if (payload.type === "error") {
                console.error(JSON.parse(payload.error));
            } else {
                setStatusEvent(payload);
            }
        });

        return () => {
            clearInterval(interval);
            unlisten.then(() => console.log(`Unsubscribed from '${IPCYoutubeEvents.YOUTUBE_EVENT}' event`));
        };
    }, []);

    return (
        <DashboardHomeStyledContainer>
            <form className="fields" onSubmit={onSubmit(handleSubmit)}>
                <Card className="fields-actions" withBorder shadow="xs">
                    <div style={{ flex: 1 }}>
                        <Button
                            type="submit"
                            color={
                                savingStatus === "saving" ? "warning" : savingStatus === "error" ? "error" : "primary"
                            }
                        >
                            <Text>
                                {savingStatus === "saving" ? "Saving..." : savingStatus === "error" ? "Error" : "Save"}
                            </Text>
                        </Button>
                    </div>

                    <div>
                        <Tooltip label={YOUTUBE_EVENT_DESCRIPTION[statusEvent.type]} position="left">
                            <Badge radius="xs" color={handleStatusColor(statusEvent.type)}>
                                {statusEvent.type === "ping" ? "working" : statusEvent.type}
                            </Badge>
                        </Tooltip>
                    </div>
                </Card>

                <Card className="fields-values" withBorder shadow="xs">
                    <TextInput
                        key={key("youtubeChatUrl")}
                        {...getInputProps("youtubeChatUrl")}
                        withAsterisk
                        label="YouTube chat url"
                        placeholder="https://www.youtube.com/live_chat?v={VIDEO_ID}"
                    />
                </Card>
            </form>
            <div className="preview">
                <Card className="preview-header" withBorder shadow="xs">
                    <div className="preview-header-widget-selector">
                        <Select value={selectedWidget} data={widgets} onChange={onChangeWidget} />
                    </div>

                    <Button onClick={() => revealItemInDir(metadata.widgetsDir)}>
                        <IconFolderFilled size="20" />
                    </Button>

                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                        <IconReload size="20" />
                    </Button>

                    <Button onClick={() => openUrl(`http://localhost:9527/widget/${selectedWidget}`)}>
                        <IconWorld size="20" />
                    </Button>
                </Card>
                <div className="iframe-wrapper">
                    <iframe
                        ref={iframeRef}
                        src={`http://localhost:9527/widget/${selectedWidget}`}
                        sandbox="allow-scripts"
                    />
                </div>
            </div>
        </DashboardHomeStyledContainer>
    );
}
