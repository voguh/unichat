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

import { Loading } from "@voguh/unichat-ui/components/Loading";
import { Tabs } from "@voguh/unichat-ui/components/ui/Tabs";
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

interface Tab {
    id: string;
    title: string;
    content: PReact.ComponentChild;
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

    function buildTabs(): Tab[] {
        const tabs: Tab[] = [];
        if (showTabs.includes("image")) {
            tabs.push({
                id: "image",
                title: "Images",
                content: <div className={styles.tabContainer}>{printGalleryItems("image")}</div>
            });
        }

        if (showTabs.includes("video")) {
            tabs.push({
                id: "video",
                title: "Videos",
                content: <div className={styles.tabContainer}>{printGalleryItems("video")}</div>
            });
        }

        if (showTabs.includes("audio")) {
            tabs.push({
                id: "audio",
                title: "Audios",
                content: <div className={styles.tabContainer}>{printGalleryItems("audio")}</div>
            });
        }
        if (showTabs.includes("file")) {
            tabs.push({
                id: "file",
                title: "Others",
                content: <div className={styles.tabContainer}>{printGalleryItems("file")}</div>
            });
        }

        if (typeof onSelectItem === "function") {
            tabs.push({
                id: "custom",
                title: "Custom",
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

    return (
        <>
            <Loading show={!!sharedStore.uploading} label="Uploading" />
            <Tabs.Root defaultValue={startSelectedTab ?? tabs[0].id}>
                <Tabs.List>
                    {tabs.map((tab) => (
                        <Tabs.Trigger key={tab.id} value={tab.id}>
                            {tab.title}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                {tabs.map((tab) => (
                    <Tabs.Content key={tab.id} value={tab.id}>
                        {tab.content}
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </>
    );
}
