/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { LoadingOverlay } from "unichat/components/LoadingOverlay";
import { Tab, Tabs } from "unichat/components/Tabs";
import { ModalContext } from "unichat/contexts/ModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { notificationService } from "unichat/services/notificationService";
import { GalleryItem } from "unichat/types";

import { GalleryItemDisplay } from "./GalleryItemDisplay";
import { GalleyCustomDisplay } from "./GalleyCustomDisplay";
import { GalleyTabEmpty } from "./GalleyTabEmpty";
import { GalleryModalStyledContainer, GalleryTabContainer } from "./styled";

export type GalleryTabs = GalleryItem["type"] | "custom";

interface Props {
    showTabs?: Omit<GalleryTabs, "custom">[];
    startSelectedTab?: GalleryTabs;
    selectedItem?: string;
    onSelectItem?: (url: string, context: { close: () => void }) => void;
}

const _logger = LoggerFactory.getLogger("Gallery");
export function GalleryModal(props: Props): PReact.ComponentChildren {
    const { onSelectItem, selectedItem = "", showTabs = ["image", "video", "audio", "file"], startSelectedTab } = props;

    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

    const { sharedStore } = useContext(ModalContext);

    function printGalleryItems(type: GalleryTabs): PReact.ComponentChildren {
        const itemsToPrint = (galleryItems ?? []).filter((item) => item.type === type);
        if (itemsToPrint.length === 0) {
            return [<GalleyTabEmpty key={crypto.randomUUID()} withSelect={!!onSelectItem} />];
        }

        return itemsToPrint.map((item) => (
            <GalleryItemDisplay
                {...item}
                key={item.title}
                onSelectItem={onSelectItem}
                selected={item.url === selectedItem}
            />
        ));
    }

    function buildTabs(): Tab[] {
        const tabs: Tab[] = [];
        if (showTabs.includes("image")) {
            tabs.push({
                title: "Images",
                content: <GalleryTabContainer>{printGalleryItems("image")}</GalleryTabContainer>
            });
        }

        if (showTabs.includes("video")) {
            tabs.push({
                title: "Videos",
                content: <GalleryTabContainer>{printGalleryItems("video")}</GalleryTabContainer>
            });
        }

        if (showTabs.includes("audio")) {
            tabs.push({
                title: "Audios",
                content: <GalleryTabContainer>{printGalleryItems("audio")}</GalleryTabContainer>
            });
        }
        if (showTabs.includes("file")) {
            tabs.push({
                title: "Others",
                content: <GalleryTabContainer>{printGalleryItems("file")}</GalleryTabContainer>
            });
        }

        if (typeof onSelectItem === "function") {
            tabs.push({
                title: "Custom",
                content: (
                    <GalleryTabContainer>
                        <GalleyCustomDisplay selectedItem={selectedItem} onSelectItem={onSelectItem} />
                    </GalleryTabContainer>
                )
            });
        }

        return tabs;
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

    useEffect(() => {
        if (!sharedStore.uploading) {
            handleFetchGalleryItems();
        }
    }, [sharedStore.uploading]);

    return (
        <GalleryModalStyledContainer>
            <LoadingOverlay visible={sharedStore.uploading} />
            <Tabs initialTab={startSelectedTab} tabs={buildTabs()} />
        </GalleryModalStyledContainer>
    );
}
