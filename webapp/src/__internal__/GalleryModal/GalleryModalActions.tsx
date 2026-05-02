/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useContext } from "preact/hooks";

import * as dialog from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "unichat/components/Button";
import { ModalContext } from "unichat/contexts/ModalContext";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";

const _logger = LoggerFactory.getLogger("GalleryModalActions");
export function GalleryModalActions(): PReact.ComponentChildren {
    const { setSharedStore } = useContext(ModalContext);

    async function onFilesUploadClick(): Promise<void> {
        try {
            setSharedStore((old) => ({ ...old, uploading: true }));
            const response = await dialog.open({ multiple: true, directory: false });
            if (response == null || !Array.isArray(response)) {
                throw new Error("Invalid response from file dialog");
            }

            await commandService.uploadGalleryItems(response);
        } catch (error) {
            _logger.error("An error occurred on upload gallery items", error);
        } finally {
            setSharedStore((old) => ({ ...old, uploading: false }));
        }
    }

    return (
        <>
            <Button variant="secondary" onClick={onFilesUploadClick}>
                <i className="fas fa-upload" />
                Add to Gallery
            </Button>
            <Button variant="secondary" onClick={() => revealItemInDir(UNICHAT_GALLERY_DIR)}>
                <i className="fas fa-folder" />
                Show Gallery Folder
            </Button>
        </>
    );
}
