/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button, LoadingOverlay, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

import { commandService } from "unichat/services/commandService";
import { loggerService } from "unichat/services/loggerService";
import { GalleryItem } from "unichat/types";

import { GalleryItemDisplay } from "./GalleryItemDisplay";
import { GalleyTabEmpty } from "./GalleyTabEmpty";
import { GalleryStyledContainer, GalleryTabContainer } from "./styled";

interface Props {
    includeCustomTabs?: boolean;
    onSelectItem?: (url: string) => void;
}

export function Gallery(props: Props): React.ReactNode {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);

    const uploadInputRef = React.useRef<HTMLInputElement>(null);

    function hasItemsInTab(type: GalleryItem["type"]): boolean {
        const itemsInTab = (galleryItems ?? []).filter((item) => item.type === type);

        return itemsInTab.length > 0;
    }

    function printGalleryItems(type: GalleryItem["type"]): JSX.Element[] {
        const itemsToPrint = (galleryItems ?? []).filter((item) => item.type === type);
        if (itemsToPrint.length === 0) {
            return [<GalleyTabEmpty key={crypto.randomUUID()} />];
        }

        return itemsToPrint.map((item) => <GalleryItemDisplay {...item} key={item.title} />);
    }

    async function handleFetchGalleryItems(): Promise<void> {
        try {
            const items = await commandService.getGalleryItems();
            setGalleryItems(items);
        } catch (error) {
            console.log(error);
            loggerService.error("An error occurred on fetch gallery items", error);

            notifications.show({
                title: "Fetch Error",
                message: "An error occurred while fetching gallery items.",
                color: "red",
                icon: <IconX />
            });
        }
    }

    async function onFilesUpload(evt: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        try {
            setLoading(true);

            const files = evt.target.files;
            if (files == null || files.length === 0) {
                return;
            }

            const filesArray = Array.from(files);
            await commandService.uploadGalleryItems(filesArray);
            await handleFetchGalleryItems();
        } catch (error) {
            console.log(error);
            loggerService.error("An error occurred on upload gallery item", error);

            notifications.show({
                title: "Upload Error",
                message: "An error occurred while uploading files to the gallery.",
                color: "red",
                icon: <IconX />
            });
        } finally {
            setLoading(false);
        }
    }

    function onFilesUploadClick(): void {
        if (uploadInputRef.current == null) {
            notifications.show({
                title: "Error",
                message: "File input element not found.",
                color: "red",
                icon: <IconX />
            });

            return;
        }

        uploadInputRef.current.click();
    }

    React.useEffect(() => {
        handleFetchGalleryItems();
    }, []);

    return (
        <GalleryStyledContainer>
            <LoadingOverlay visible={loading} />
            <Button className="upload-to-gallery" size="xs" onClick={onFilesUploadClick}>
                <input ref={uploadInputRef} type="file" style={{ display: "none" }} onChange={onFilesUpload} />
                Upload
            </Button>
            <Tabs variant="outline" defaultValue="images">
                <Tabs.List>
                    <Tabs.Tab value="images">Images</Tabs.Tab>
                    <Tabs.Tab value="videos">Videos</Tabs.Tab>
                    <Tabs.Tab value="audios">Audios</Tabs.Tab>
                    <Tabs.Tab value="others">Others</Tabs.Tab>
                    {props.includeCustomTabs && <Tabs.Tab value="custom">Custom</Tabs.Tab>}
                </Tabs.List>

                <Tabs.Panel value="images">
                    <GalleryTabContainer cols={hasItemsInTab("image") ? 3 : 1}>
                        {printGalleryItems("image")}
                    </GalleryTabContainer>
                </Tabs.Panel>
                <Tabs.Panel value="videos">
                    <GalleryTabContainer cols={hasItemsInTab("video") ? 3 : 1}>
                        {printGalleryItems("video")}
                    </GalleryTabContainer>
                </Tabs.Panel>
                <Tabs.Panel value="audios">
                    <GalleryTabContainer cols={hasItemsInTab("audio") ? 3 : 1}>
                        {printGalleryItems("audio")}
                    </GalleryTabContainer>
                </Tabs.Panel>
                <Tabs.Panel value="others">
                    <GalleryTabContainer cols={hasItemsInTab("file") ? 3 : 1}>
                        {printGalleryItems("file")}
                    </GalleryTabContainer>
                </Tabs.Panel>
                {props.includeCustomTabs && (
                    <Tabs.Panel value="custom">
                        <GalleryTabContainer></GalleryTabContainer>
                    </Tabs.Panel>
                )}
            </Tabs>
        </GalleryStyledContainer>
    );
}
