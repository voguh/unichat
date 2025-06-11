import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
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

const defaultValues: FormData = {
    youtubeChatUrl: ""
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

    const { control, handleSubmit, reset } = useForm({ defaultValues, mode: "all" });

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    function onChangeWidget(evt: SelectChangeEvent<string>): void {
        setSelectedWidget(evt.target.value);
    }

    async function openWidgetsDir(): Promise<void> {
        invoke("open_widgets_dir");
    }

    async function reloadIframe(): Promise<void> {
        const widgets = await invoke<string[]>("list_widgets");
        setWidgets(widgets);

        iframeRef.current?.contentWindow.location.reload();
    }

    async function onSubmit(formData: FormData): Promise<void> {
        try {
            setSavingStatus("saving");
            if (!Strings.isValidYouTubeChatUrl(formData.youtubeChatUrl)) {
                formData.youtubeChatUrl = "about:blank";
            }

            await storageService.setItem(YOUTUBE_CHAT_URL_KEY, formData.youtubeChatUrl);
            await invoke("update_webview_url", { label: "youtube-chat", url: formData.youtubeChatUrl });
            setSavingStatus("saved");
            toast.success("Successfully saved");
        } catch (err) {
            console.error(err);
            setSavingStatus("error");
            toast.error("An error occurred on save");
        }
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const youtubeChatUrl = await storageService.getItem<string>(YOUTUBE_CHAT_URL_KEY);

            const widgets = await invoke<string[]>("list_widgets");
            setWidgets(widgets);

            reset({ youtubeChatUrl });
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
            <form className="fields" onSubmit={handleSubmit(onSubmit)}>
                <Paper className="fields-actions">
                    <div>
                        <Button
                            type="submit"
                            color={
                                savingStatus === "saving" ? "warning" : savingStatus === "error" ? "error" : "primary"
                            }
                        >
                            {savingStatus === "saving" ? "Saving..." : savingStatus === "error" ? "Error" : "Save"}
                        </Button>
                    </div>

                    <ScrapperStatus statusEvent={statusEvent} />
                </Paper>

                <Paper className="fields-values">
                    <Controller
                        control={control}
                        name="youtubeChatUrl"
                        render={function ControllerRender({ field, fieldState }): JSX.Element {
                            return (
                                <TextField
                                    {...field}
                                    error={!!fieldState.error}
                                    size="small"
                                    variant="outlined"
                                    fullWidth
                                    label="YouTube chat url"
                                    placeholder="https://www.youtube.com/live_chat?v={VIDEO_ID}"
                                />
                            );
                        }}
                    />
                </Paper>
            </form>
            <Paper className="preview">
                <Paper className="preview-header">
                    <FormControl fullWidth size="small" variant="outlined">
                        <InputLabel id="unichat-widget">Widget</InputLabel>
                        <Select
                            labelId="unichat-widget"
                            label="Widget"
                            value={selectedWidget}
                            onChange={onChangeWidget}
                        >
                            {widgets.map((widget) => (
                                <MenuItem key={widget} value={widget}>
                                    {widget}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button onClick={openWidgetsDir}>
                        <i className="fas fa-folder" />
                    </Button>

                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                    </Button>

                    <Button
                        onClick={() => navigator.clipboard.writeText(`http://localhost:9527/widget/${selectedWidget}`)}
                    >
                        <i className="fas fa-globe" />
                    </Button>
                </Paper>
                <iframe
                    ref={iframeRef}
                    src={`http://localhost:9527/widget/${selectedWidget}`}
                    sandbox="allow-scripts"
                />
            </Paper>
        </DashboardHomeStyledContainer>
    );
}
