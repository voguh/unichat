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
import { useContext } from "preact/hooks";

import { Button } from "@voguh/unichat-ui/components/ui/Button";
import { Tooltip } from "@voguh/unichat-ui/components/ui/Tooltip";
import { ModalContext } from "unichat/contexts/ModalContext";
import type { GalleryItem } from "unichat/types";

import styles from "./styles.module.css";

interface Props extends GalleryItem {
    selected?: boolean;
    onSelectItem?: (url: string, context: { close: () => void }) => void;
}

export function GalleryItemDisplay(props: Props): PReact.ComponentChildren {
    const { previewUrl, title, type, url, onSelectItem, selected } = props;

    const { onClose } = useContext(ModalContext);

    function renderPreview(): PReact.ComponentChildren {
        if ((previewUrl ?? "").trim().length > 0) {
            if (type === "image") {
                return <img src={previewUrl} />;
            } else if (type === "video") {
                return <video src={previewUrl} controls />;
            } else if (type === "audio") {
                return <audio src={previewUrl} controls />;
            }
        }

        return <img src="https://placehold.co/600x400?text=No+Preview" />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.name}>
                <Tooltip content={title}>
                    <span>{title}</span>
                </Tooltip>
            </div>
            <div className={styles.preview}>{renderPreview()}</div>
            {!!onSelectItem && (
                <div className={styles.footer}>
                    <Button
                        variant={selected ? "success" : "secondary"}
                        disabled={selected}
                        onClick={() => onSelectItem(url, { close: onClose })}
                    >
                        {selected ? "Selected" : "Select"}
                    </Button>
                </div>
            )}
        </div>
    );
}
