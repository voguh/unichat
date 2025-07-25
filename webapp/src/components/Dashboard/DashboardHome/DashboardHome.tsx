/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, Card, ComboboxItemGroup, Select, Tooltip } from "@mantine/core";
import { IconFolderFilled, IconReload, IconWorld } from "@tabler/icons-react";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCard } from "./ScrapperCard/ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidget, setSelectedWidget] = React.useState("default");
    const [widgets, setWidgets] = React.useState<ComboboxItemGroup<string>[]>([]);

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
        }

        let videoId = value;
        if (value.startsWith("https://www.youtube.com/live/") || value.startsWith("https://youtu.be")) {
            const parts = value.split("?")[0].split("/");
            videoId = parts.at(-1);
        } else if (value.startsWith("https://www.youtube.com")) {
            const params = new URLSearchParams(value.split("?")[1]);
            videoId = params.get("v");
        }

        if (!Strings.isValidYouTubeVideoId(videoId)) {
            throw new Error("Invalid YouTube chat URL");
        }

        return [`https://www.youtube.com/live_chat?v=${videoId}`, videoId];
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
                        <Tooltip label="Widgets" position="bottom" withArrow>
                            <Select value={selectedWidget} data={widgets} onChange={onChangeWidget} />
                        </Tooltip>
                    </div>

                    <Tooltip label="Open user widgets folder" position="bottom" withArrow>
                        <Button onClick={() => revealItemInDir(metadata.widgetsDir)}>
                            <IconFolderFilled size="20" />
                        </Button>
                    </Tooltip>

                    <Tooltip label="Reload Widget view" position="bottom" withArrow>
                        <Button onClick={reloadIframe}>
                            <i className="fas fa-sync" />
                            <IconReload size="20" />
                        </Button>
                    </Tooltip>

                    <Tooltip label="Open in browser" position="bottom" withArrow>
                        <Button onClick={() => openUrl(`http://localhost:9527/widget/${selectedWidget}`)}>
                            <IconWorld size="20" />
                        </Button>
                    </Tooltip>
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
