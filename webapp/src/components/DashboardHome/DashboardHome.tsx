/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Badge, Button, Card, ComboboxData, List, Select, Tooltip } from "@mantine/core";
import { IconReload, IconWorld } from "@tabler/icons-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";

import { ScrapperCard } from "./ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidgetUrl, setSelectedWidgetUrl] = React.useState(`${WIDGET_URL_PREFIX}/default`);
    const [widgets, setWidgets] = React.useState<ComboboxData>([]);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { showWidgetPreview } = React.useContext(AppContext);

    function normalizeUrlScheme(value: string): string {
        value = value.replace(/^https?:\/\//, "");
        value = value.replace(/^www\./, "");

        if (Strings.isValidDomain(value)) {
            return `https://${value}`;
        }

        return value;
    }

    /* ====================================================================== */

    function mountYouTubeEditingTooltip(): React.ReactNode {
        // prettier-ignore
        return (
            <>
                You can enter just the video ID or one of the following URLs to get the YouTube chat:
                <br />
                <List size="xs">
                    <li dangerouslySetInnerHTML={{ __html: "youtube.com/live_chat?v={VIDEO_ID}" }} />
                    <li dangerouslySetInnerHTML={{ __html: "youtube.com/watch?v={VIDEO_ID}" }} />
                    <li dangerouslySetInnerHTML={{ __html: "youtube.com/live/{VIDEO_ID}" }} />
                    <li dangerouslySetInnerHTML={{ __html: "youtube.com/shorts/{VIDEO_ID}" }} />
                    <li dangerouslySetInnerHTML={{ __html: "youtu.be/{VIDEO_ID}" }} />
                </List>
                <br />
                You can enter the URL with or without the <Badge size="xs" radius="xs">www.</Badge> prefix.
                <br />
                You can also include or omit the <Badge size="xs" radius="xs" color="green">https://</Badge> or <Badge size="xs" radius="xs" color="red">http://</Badge> prefix.
            </>
        );
    }

    function validateYouTubeChatUrl(value: string): [string, string] {
        // Normalize the URL to ensure it starts with a valid protocol
        value = normalizeUrlScheme(value);

        // Ensure that the URL starts with valid domain
        if (value.startsWith("https://youtube.com")) {
            value = value.replace("https://", "https://www.");
        }

        let videoId = value;
        if (
            value.startsWith("https://www.youtube.com/live/") ||
            value.startsWith("https://www.youtube.com/shorts/") ||
            value.startsWith("https://youtu.be")
        ) {
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

    function mountTwitchEditingTooltip(): React.ReactNode {
        // prettier-ignore
        return (
            <>
                You can enter just the channel name or one of the following URLs to get the Twitch chat:
                <br />
                <List size="xs">
                    <li dangerouslySetInnerHTML={{ __html: "twitch.tv/popout/{CHANNEL_NAME}/chat" }} />
                    <li dangerouslySetInnerHTML={{ __html: "twitch.tv/{CHANNEL_NAME}" }} />
                </List>
                <br />
                You can enter the URL with or without the <Badge size="xs" radius="xs">www.</Badge> prefix.
                <br />
                You can also include or omit the <Badge size="xs" radius="xs" color="green">https://</Badge> or <Badge size="xs" radius="xs" color="red">http://</Badge> prefix.
            </>
        );
    }

    function validateTwitchChatUrl(value: string): [string, string] {
        // Normalize the URL to ensure it starts with a valid protocol
        value = normalizeUrlScheme(value);

        // Ensure that the URL starts with valid domain
        if (value.startsWith("https://twitch.tv")) {
            value = value.replace("https://", "https://www.");
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

    async function reloadIframe(): Promise<void> {
        const widgets = await commandService.listWidgets();
        setWidgets(widgets);

        if (iframeRef.current) {
            iframeRef.current.src = selectedWidgetUrl;
        }
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
                <ScrapperCard
                    type="youtube"
                    validateUrl={validateYouTubeChatUrl}
                    editingTooltip={mountYouTubeEditingTooltip()}
                />
                <ScrapperCard
                    type="twitch"
                    validateUrl={validateTwitchChatUrl}
                    editingTooltip={mountTwitchEditingTooltip()}
                />
            </div>
            <div className="preview">
                {showWidgetPreview ? (
                    <>
                        <Card className="preview-header" withBorder shadow="xs">
                            <div className="preview-header-widget-selector">
                                <Select
                                    value={selectedWidgetUrl}
                                    data={widgets.map((group) => ({
                                        ...group,
                                        items: group.items.map((item) => `${WIDGET_URL_PREFIX}/${item}`)
                                    }))}
                                    onChange={setSelectedWidgetUrl}
                                    data-tour="widgets-selector"
                                />
                            </div>

                            <Tooltip label="Reload widget view" position="left" withArrow>
                                <Button onClick={reloadIframe} data-tour="preview-reload">
                                    <i className="fas fa-sync" />
                                    <IconReload size="20" />
                                </Button>
                            </Tooltip>

                            <Tooltip label="Open in browser" position="left" withArrow>
                                <Button onClick={() => openUrl(selectedWidgetUrl)} data-tour="preview-open-in-browser">
                                    <IconWorld size="20" />
                                </Button>
                            </Tooltip>
                        </Card>
                        <div className="iframe-wrapper">
                            <iframe ref={iframeRef} src={selectedWidgetUrl} sandbox="allow-scripts" />
                        </div>
                    </>
                ) : (
                    <div className="iframe-placeholder">Widget preview is disabled.</div>
                )}
            </div>
        </DashboardHomeStyledContainer>
    );
}
