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

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { GalleryModalActions } from "unichat/__internal__/GalleryModal";
import { Button } from "unichat/components/Button";
import { Tooltip } from "unichat/components/Tooltip";
import { modalService } from "unichat/services/modalService";

export function WidgetEditorLeftSection(): PReact.ComponentChildren {
    function toggleGallery(): void {
        modalService.openModal({
            size: "xl",
            title: "Gallery",
            actions: <GalleryModalActions />,
            children: <>Gallery modal content</>
        });
    }

    return (
        <>
            <Tooltip content="Open user widgets folder" placement="right">
                <Button
                    variant="secondary"
                    onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}
                    data-tour="user-widgets-directory"
                >
                    <i className="fas fa-folder" />
                </Button>
            </Tooltip>
            <Tooltip content="Gallery" placement="right">
                <Button variant="secondary" onClick={toggleGallery} data-tour="gallery-toggle">
                    <i className="fas fa-images" />
                </Button>
            </Tooltip>
        </>
    );
}
