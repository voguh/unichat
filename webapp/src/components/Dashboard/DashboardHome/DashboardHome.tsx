/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
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

import { Button, Card, Select } from "@mantine/core";
import { IconFolderFilled, IconReload, IconWorld } from "@tabler/icons-react";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCard } from "./ScrapperCard/ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidget, setSelectedWidget] = React.useState("default");
    const [widgets, setWidgets] = React.useState<string[]>([]);

    const { metadata } = React.useContext(AppContext);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    /* ====================================================================== */

    function validateYouTubeChatUrl(value: string): [string, string] {
        // Normalize the URL to ensure it starts with a valid protocol
        if (value.startsWith("youtube.com")) {
            value = `https://www.${value}`;
        } else if (value.startsWith("www.youtube.com")) {
            value = `https://${value}`;
        } else if (value.startsWith("youtu.be")) {
            value = `https://${value}`;
            console.log(value, value.startsWith("https://youtu.be"));
        }

        //
        if (Strings.isValidYouTubeVideoId(value)) {
            value = `https://www.youtube.com/live_chat?v=${value}`;
        } else if (value.startsWith("https://www.youtube.com/watch")) {
            const params = new URLSearchParams(value.split("?")[1]);
            const videoId = params.get("v") || value.trim();
            if (!Strings.isValidYouTubeVideoId(videoId)) {
                throw new Error("Invalid YouTube video ID");
            }

            value = `https://www.youtube.com/live_chat?v=${videoId}`;
        } else if (value.startsWith("https://youtu.be")) {
            const parts = value.split("/");
            const videoId = parts.at(-1);
            if (!Strings.isValidYouTubeVideoId(videoId)) {
                throw new Error("Invalid YouTube video ID");
            }

            value = `https://www.youtube.com/live_chat?v=${videoId}`;
        }

        if (!Strings.isValidYouTubeChatUrl(value)) {
            throw new Error("Invalid YouTube chat URL");
        }

        return [value, value];
    }

    /* ====================================================================== */

    function validateTwitchChatUrl(value: string): [string, string] {
        // Normalize the URL to ensure it starts with a valid protocol
        if (value.startsWith("twitch.tv")) {
            value = `https://www.${value}`;
        } else if (value.startsWith("www.twitch.tv")) {
            value = `https://${value}`;
        }

        let channelName = value;
        if (value.startsWith("https://www.twitch.tv/")) {
            const parts = value.replace("https://www.twitch.tv/", "").split("/");

            if (parts[0] === "popout" && parts[2] === "chat") {
                channelName = parts[1];
            } else {
                channelName = parts[0];
            }
        }

        if (!Strings.isValidTwitchChannelName(channelName)) {
            throw new Error("Invalid Twitch chat URL");
        }

        return [`https://www.twitch.tv/popout/${channelName}/chat`, channelName];
    }

    /* ====================================================================== */

    function onChangeWidget(widgetName: string): void {
        setSelectedWidget(widgetName);
    }

    async function reloadIframe(): Promise<void> {
        const widgets = await commandService.listWidgets();
        setWidgets(widgets);

        iframeRef.current?.contentWindow.location.reload();
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await commandService.listWidgets();
            setWidgets(widgets);
        }

        init();
    }, []);

    return (
        <DashboardHomeStyledContainer>
            <div className="fields">
                <ScrapperCard type="youtube" validateUrl={validateYouTubeChatUrl} />
                <ScrapperCard type="twitch" validateUrl={validateTwitchChatUrl} />
            </div>
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
