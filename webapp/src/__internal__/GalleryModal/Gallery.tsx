/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import * as dialog from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { LoadingOverlay } from "unichat/components/LoadingOverlay";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { notificationService } from "unichat/services/notificationService";
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
    onSelectItem?: (url: string, context: { close: () => void }) => void;
}

const _logger = LoggerFactory.getLogger("Gallery");
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
            return [<GalleyTabEmpty key={crypto.randomUUID()} withSelect={!!onSelectItem} />];
        }

        return itemsToPrint.map((item) => (
            <Col key={item.title}>
                <GalleryItemDisplay {...item} onSelectItem={onSelectItem} selected={item.url === selectedItem} />
            </Col>
        ));
    }

    async function handleFetchGalleryItems(): Promise<void> {
        try {
            const items = await commandService.getGalleryItems();
            setGalleryItems(items);
        } catch (error) {
            _logger.error("An error occurred on fetch gallery items", error);

            notificationService.error({
                title: "Fetch Error",
                message: "An error occurred while fetching gallery items."
            });
        }
    }

    async function onFilesUploadClick(): Promise<void> {
        try {
            setLoading(true);
            const response = await dialog.open({ multiple: true, directory: false });
            if (response == null || !Array.isArray(response)) {
                throw new Error("Invalid response from file dialog");
            }

            await commandService.uploadGalleryItems(response);
            await handleFetchGalleryItems();
        } catch (error) {
            _logger.error("An error occurred on upload gallery items", error);

            notificationService.error({
                title: "Upload Error",
                message: "An error occurred while uploading gallery items."
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
            <Button className="upload-to-gallery" onClick={onFilesUploadClick}>
                Add to Gallery
            </Button>
            <Tabs defaultActiveKey={(startSelectedTab ?? showTabs[0]) as string}>
                {showTabs.includes("image") && (
                    <Tab eventKey="image" title="Images">
                        <GalleryTabContainer xs={hasItemsInTab("image") ? 3 : 1}>
                            {printGalleryItems("image")}
                        </GalleryTabContainer>
                    </Tab>
                )}
                {showTabs.includes("video") && (
                    <Tab eventKey="video" title="Videos">
                        <GalleryTabContainer xs={hasItemsInTab("video") ? 3 : 1}>
                            {printGalleryItems("video")}
                        </GalleryTabContainer>
                    </Tab>
                )}
                {showTabs.includes("audio") && (
                    <Tab eventKey="audio" title="Audios">
                        <GalleryTabContainer xs={hasItemsInTab("audio") ? 3 : 1}>
                            {printGalleryItems("audio")}
                        </GalleryTabContainer>
                    </Tab>
                )}
                {showTabs.includes("file") && (
                    <Tab eventKey="file" title="Others">
                        <GalleryTabContainer xs={hasItemsInTab("file") ? 3 : 1}>
                            {printGalleryItems("file")}
                        </GalleryTabContainer>
                    </Tab>
                )}
                {typeof onSelectItem === "function" && (
                    <Tab eventKey="custom" title="Custom">
                        <GalleryTabContainer xs={1}>
                            <GalleyCustomDisplay selectedItem={selectedItem} onSelectItem={onSelectItem} />
                        </GalleryTabContainer>
                    </Tab>
                )}
            </Tabs>
        </GalleryStyledContainer>
    );
}

export function GalleryActions(_props: Props): React.ReactNode {
    return (
        <Button variant="outline-primary" onClick={() => revealItemInDir(UNICHAT_GALLERY_DIR)}>
            <i className="fas fa-folder" />
            &nbsp;Show Gallery Folder
        </Button>
    );
}
