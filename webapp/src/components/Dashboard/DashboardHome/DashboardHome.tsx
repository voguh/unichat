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

import { storageService } from "unichat/services/storageService";
import { YOUTUBE_CHAT_URL_KEY } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { DashboardHomeStyledContainer } from "./styled";

interface FormData {
  youtubeChatUrl: string;
}

const defaultValues: FormData = {
  youtubeChatUrl: ""
};

export function DashboardHome(): React.ReactNode {
  const [selectedOverlay, setSelectedOverlay] = React.useState("default");
  const [overlays, setOverlays] = React.useState<string[]>([]);

  const [savingStatus, setSavingStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  const { control, handleSubmit, reset } = useForm({ defaultValues, mode: "all" });

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  function onChangeOverlay(evt: SelectChangeEvent<string>): void {
    setSelectedOverlay(evt.target.value);
  }

  async function openOverlaysDir(): Promise<void> {
    invoke("open_overlays_dir");
  }

  async function reloadIframe(): Promise<void> {
    const overlays = await invoke<string[]>("list_overlays");
    setOverlays(overlays);

    iframeRef.current?.contentWindow.location.reload();
  }

  async function onSubmit(formData: FormData): Promise<void> {
    try {
      setSavingStatus("saving");

      await storageService.setItem(YOUTUBE_CHAT_URL_KEY, formData.youtubeChatUrl);

      if (Strings.isValidYouTubeChatUrl(formData.youtubeChatUrl)) {
        await invoke("update_webview_url", { label: "youtube-chat", url: formData.youtubeChatUrl });
      } else {
        await invoke("update_webview_url", { label: "youtube-chat", url: "about:blank" });
      }

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

      const overlays = await invoke<string[]>("list_overlays");
      setOverlays(overlays);

      reset({ youtubeChatUrl });
    }

    init();
  }, []);

  return (
    <DashboardHomeStyledContainer>
      <form className="fields" onSubmit={handleSubmit(onSubmit)}>
        <Paper className="fields-actions">
          <Button
            type="submit"
            color={savingStatus === "saving" ? "warning" : savingStatus === "error" ? "error" : "primary"}
          >
            {savingStatus === "saving" ? "Saving..." : savingStatus === "error" ? "Error" : "Save"}
          </Button>
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
            <InputLabel id="unichat-overlay">Overlay</InputLabel>
            <Select labelId="unichat-overlay" label="Overlay" value={selectedOverlay} onChange={onChangeOverlay}>
              {overlays.map((overlay) => (
                <MenuItem key={overlay} value={overlay}>
                  {overlay}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={openOverlaysDir}>
            <i className="fas fa-folder" />
          </Button>

          <Button onClick={reloadIframe}>
            <i className="fas fa-sync" />
          </Button>

          <Button onClick={() => navigator.clipboard.writeText(`http://localhost:9527/overlays/${selectedOverlay}`)}>
            <i className="fas fa-globe" />
          </Button>
        </Paper>
        <iframe ref={iframeRef} src={`http://localhost:9527/overlays/${selectedOverlay}`} sandbox="allow-scripts" />
      </Paper>
    </DashboardHomeStyledContainer>
  );
}
