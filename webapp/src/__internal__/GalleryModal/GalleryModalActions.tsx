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

import { Button } from "unichat/components/Button";

export function GalleryModalActions(): PReact.ComponentChildren {
    return (
        <Button variant="secondary" onClick={() => revealItemInDir(UNICHAT_GALLERY_DIR)}>
            <i className="fas fa-folder" />
            Show Gallery Folder
        </Button>
    );
}
