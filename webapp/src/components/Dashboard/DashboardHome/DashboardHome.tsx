import React from "react";

import { Button, Card, Select, Text, TextInput } from "@mantine/core";
import { FormValidateInput, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFolderFilled, IconReload, IconWorld } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import * as event from "@tauri-apps/api/event";

import { storageService } from "unichat/services/storageService";
import { YOUTUBE_CHAT_URL_KEY } from "unichat/utils/constants";
import { IPCYoutubeEvents, IPCYouTubeStatusEvent, IPCYouTubeStatusPingEvent } from "unichat/utils/IPCYoutubeEvents";
import { Strings } from "unichat/utils/Strings";

import { ScrapperStatus } from "./ScrapperStatus";
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

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function onChangeWidget(widgetName: string): void {
        setSelectedWidget(widgetName);
    }

    async function openWidgetsDir(): Promise<void> {
        invoke("open_widgets_dir");
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
            if (statusEvent.type === "working" && Date.now() - statusEvent.timestamp > 5000) {
                return { type: "error", error: null, timestamp: Date.now() };
            }

            return statusEvent;
        });
    }

    React.useEffect(() => {
        const interval = setInterval(handleStatus, 5000);
        const unlistenPing = event.listen<IPCYouTubeStatusPingEvent>(IPCYoutubeEvents.YOUTUBE_EVENT, ({ payload }) => {
            setStatusEvent(payload);
        });

        return () => {
            clearInterval(interval);
            unlistenPing.then(() => console.log(`Unsubscribed from '${IPCYoutubeEvents.YOUTUBE_EVENT}' event`));
        };
    }, []);

    return (
        <DashboardHomeStyledContainer>
            <form className="fields" onSubmit={onSubmit(handleSubmit)}>
                <Card className="fields-actions" withBorder shadow="xs">
                    <div style={{ width: "100%" }}>
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

                    <ScrapperStatus statusEvent={statusEvent} />
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

                    <Button onClick={openWidgetsDir}>
                        <IconFolderFilled size="20" />
                    </Button>

                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                        <IconReload size="20" />
                    </Button>

                    <Button
                        onClick={() => navigator.clipboard.writeText(`http://localhost:9527/widget/${selectedWidget}`)}
                    >
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
