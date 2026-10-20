/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "@voguh/unichat-ui/components/ui/Button";
import { Tooltip } from "@voguh/unichat-ui/components/ui/Tooltip";
import { GalleryModal, GalleryModalActions } from "unichat/__internal__/GalleryModal";
import { modalService } from "unichat/services/modalService";

export function WidgetEditorLeftSection(): PReact.ComponentChildren {
    function toggleGallery(): void {
        modalService.openModal({
            size: "xl",
            title: "Gallery",
            actions: <GalleryModalActions />,
            children: <GalleryModal />
        });
    }

    return (
        <>
            <Tooltip.Root positioning={{ placement: "right" }}>
                <Tooltip.Trigger asChild>
                    <Button
                        variant="secondary"
                        onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}
                        data-tour="user-widgets-directory"
                    >
                        <i className="fas fa-folder" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Open user widgets folder</Tooltip.Content>
            </Tooltip.Root>
            <Tooltip.Root positioning={{ placement: "right" }}>
                <Tooltip.Trigger asChild>
                    <Button variant="secondary" onClick={toggleGallery} data-tour="gallery-toggle">
                        <i className="fas fa-images" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Gallery</Tooltip.Content>
            </Tooltip.Root>
        </>
    );
}
