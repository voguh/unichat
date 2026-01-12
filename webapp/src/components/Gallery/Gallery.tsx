/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, LoadingOverlay, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as dialog from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { AppContext } from "unichat/contexts/AppContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { GalleryItem } from "unichat/types";

import { GalleryItemDisplay } from "./GalleryItemDisplay";
import { GalleyCustomDisplay } from "./GalleyCustomDisplay";
import { GalleyTabEmpty } from "./GalleyTabEmpty";
import { GalleryStyledContainer, GalleryTabContainer } from "./styled";

export type GalleryTabs = GalleryItem["type"] | "custom";

interface Props {
    showTabs?: Omit<GalleryTabs, "custom">[];
    startSelectedTab?: GalleryTabs;
    selectedItem?: string;
    onSelectItem?: (url: string) => void;
}

const _logger = LoggerFactory.getLogger(import.meta.url);
export function Gallery(props: Props): React.ReactNode {
    const { onSelectItem, selectedItem = "", showTabs = ["image", "video", "audio", "file"], startSelectedTab } = props;

    const [loading, setLoading] = React.useState<boolean>(false);
    const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);

    function hasItemsInTab(type: GalleryTabs): boolean {
        const itemsInTab = (galleryItems ?? []).filter((item) => item.type === type);

        return itemsInTab.length > 0;
    }

    function printGalleryItems(type: GalleryTabs): JSX.Element[] {
        const itemsToPrint = (galleryItems ?? []).filter((item) => item.type === type);
        if (itemsToPrint.length === 0) {
            return [<GalleyTabEmpty key={crypto.randomUUID()} />];
        }

        return itemsToPrint.map((item) => (
            <GalleryItemDisplay
                key={item.title}
                onClick={typeof onSelectItem === "function" ? () => onSelectItem(item.url) : undefined}
                selected={item.url === selectedItem}
                {...item}
            />
        ));
    }

    async function handleFetchGalleryItems(): Promise<void> {
        try {
            const items = await commandService.getGalleryItems();
            setGalleryItems(items);
        } catch (error) {
            _logger.error("An error occurred on fetch gallery items", error);

            notifications.show({
                title: "Fetch Error",
                message: "An error occurred while fetching gallery items.",
                color: "red",
                icon: <i className="fas fa-times" />
            });
        }
    }

    async function onFilesUploadClick(): Promise<void> {
        try {
            setLoading(true);
            const response = await dialog.open({ multiple: true, directory: false });
            await commandService.uploadGalleryItems(response);
            await handleFetchGalleryItems();
        } catch (error) {
            _logger.error("An error occurred on upload gallery items", error);

            notifications.show({
                title: "Upload Error",
                message: "An error occurred while uploading gallery items.",
                color: "red",
                icon: <i className="fas fa-times" />
            });
        } finally {
            setLoading(false);
            await handleFetchGalleryItems();
        }
    }

    React.useEffect(() => {
        handleFetchGalleryItems();
    }, []);

    return (
        <GalleryStyledContainer>
            <LoadingOverlay visible={loading} />
            <Button className="upload-to-gallery" size="xs" onClick={onFilesUploadClick}>
                Add to Gallery
            </Button>
            <Tabs variant="outline" defaultValue={(startSelectedTab ?? showTabs[0]) as GalleryTabs}>
                <Tabs.List>
                    {showTabs.includes("image") && <Tabs.Tab value="image">Images</Tabs.Tab>}
                    {showTabs.includes("video") && <Tabs.Tab value="video">Videos</Tabs.Tab>}
                    {showTabs.includes("audio") && <Tabs.Tab value="audio">Audios</Tabs.Tab>}
                    {showTabs.includes("file") && <Tabs.Tab value="file">Others</Tabs.Tab>}
                    {typeof onSelectItem === "function" && <Tabs.Tab value="custom">Custom</Tabs.Tab>}
                </Tabs.List>

                {showTabs.includes("image") && (
                    <Tabs.Panel value="image">
                        <GalleryTabContainer cols={hasItemsInTab("image") ? 3 : 1}>
                            {printGalleryItems("image")}
                        </GalleryTabContainer>
                    </Tabs.Panel>
                )}
                {showTabs.includes("video") && (
                    <Tabs.Panel value="video">
                        <GalleryTabContainer cols={hasItemsInTab("video") ? 3 : 1}>
                            {printGalleryItems("video")}
                        </GalleryTabContainer>
                    </Tabs.Panel>
                )}
                {showTabs.includes("audio") && (
                    <Tabs.Panel value="audio">
                        <GalleryTabContainer cols={hasItemsInTab("audio") ? 3 : 1}>
                            {printGalleryItems("audio")}
                        </GalleryTabContainer>
                    </Tabs.Panel>
                )}
                {showTabs.includes("file") && (
                    <Tabs.Panel value="file">
                        <GalleryTabContainer cols={hasItemsInTab("file") ? 3 : 1}>
                            {printGalleryItems("file")}
                        </GalleryTabContainer>
                    </Tabs.Panel>
                )}
                {typeof onSelectItem === "function" && (
                    <Tabs.Panel value="custom">
                        <GalleryTabContainer cols={1}>
                            <GalleyCustomDisplay selectedItem={selectedItem} onSelectItem={onSelectItem} />
                        </GalleryTabContainer>
                    </Tabs.Panel>
                )}
            </Tabs>
        </GalleryStyledContainer>
    );
}

export function GalleryActions(_props: Props): React.ReactNode {
    const { metadata } = React.useContext(AppContext);

    return (
        <Button variant="outline" size="xs" onClick={() => revealItemInDir(metadata.galleryDir)}>
            <i className="fas fa-folder" />
            &nbsp;Show Gallery Folder
        </Button>
    );
}
