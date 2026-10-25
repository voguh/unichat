/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

import { Loading } from "@voguh/unichat-ui/Loading";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@voguh/unichat-ui/Tabs";
import { ModalContext } from "unichat/contexts/ModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { notificationService } from "unichat/services/notificationService";
import type { GalleryItem } from "unichat/types";

import { GalleryItemDisplay } from "./GalleryItemDisplay";
import { GalleyCustomDisplay } from "./GalleyCustomDisplay";
import { GalleyTabEmpty } from "./GalleyTabEmpty";
import styles from "./styles.module.css";

export type GalleryTabs = GalleryItem["type"] | "custom";

interface GalleryTab {
    value: GalleryTabs;
    label: string;
    content: PReact.ComponentChildren;
}

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

    function buildTabs(): GalleryTab[] {
        const tabs: GalleryTab[] = [];
        if (showTabs.includes("image")) {
            tabs.push({
                value: "image",
                label: "Images",
                content: <div className={styles.tabContainer}>{printGalleryItems("image")}</div>
            });
        }

        if (showTabs.includes("video")) {
            tabs.push({
                value: "video",
                label: "Videos",
                content: <div className={styles.tabContainer}>{printGalleryItems("video")}</div>
            });
        }

        if (showTabs.includes("audio")) {
            tabs.push({
                value: "audio",
                label: "Audios",
                content: <div className={styles.tabContainer}>{printGalleryItems("audio")}</div>
            });
        }
        if (showTabs.includes("file")) {
            tabs.push({
                value: "file",
                label: "Others",
                content: <div className={styles.tabContainer}>{printGalleryItems("file")}</div>
            });
        }

        if (typeof onSelectItem === "function") {
            tabs.push({
                value: "custom",
                label: "Custom",
                content: (
                    <div className={styles.tabContainer}>
                        <GalleyCustomDisplay selectedItem={selectedItem} onSelectItem={onSelectItem} />
                    </div>
                )
            });
        }

        return tabs;
    }

    useEffect(() => {
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

        if (!sharedStore.uploading) {
            handleFetchGalleryItems();
        }
    }, [sharedStore.uploading]);

    const tabs = buildTabs();
    const selectedIndex = tabs.findIndex((tab) => tab.value === startSelectedTab);
    const startIndex = Math.max(selectedIndex, 0);

    return (
        <>
            <Loading show={!!sharedStore.uploading} label="Uploading" />
            <TabGroup defaultIndex={startIndex}>
                <TabList>
                    {tabs.map((tab) => (
                        <Tab key={tab.value}>{tab.label}</Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {tabs.map((tab) => (
                        <TabPanel key={tab.value}>{tab.content}</TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </>
    );
}
