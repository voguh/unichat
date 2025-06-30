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
import { invoke } from "@tauri-apps/api/core";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";

import { ScrapperCard } from "./ScrapperCard/ScrapperCard";
import { DashboardHomeStyledContainer } from "./styled";

export function DashboardHome(): React.ReactNode {
    const [selectedWidget, setSelectedWidget] = React.useState("default");
    const [widgets, setWidgets] = React.useState<string[]>([]);

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

    React.useEffect(() => {
        async function init(): Promise<void> {
            const widgets = await invoke<string[]>("list_widgets");
            setWidgets(widgets);
        }

        init();
    }, []);

    return (
        <DashboardHomeStyledContainer>
            <div className="fields">
                <ScrapperCard />
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
