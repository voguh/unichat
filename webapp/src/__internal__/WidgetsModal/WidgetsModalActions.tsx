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

import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "unichat/components/Button";

export function WidgetsModalActions(): PReact.ComponentChildren {
    return (
        <>
            <Button
                variant="default"
                onClick={() => openUrl("https://unichat.voguh.me/docs/1.5.x/widgets/getting_started.html")}
            >
                <i className="fas fa-book" />
                Read the Docs
            </Button>
            <Button onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                <i className="fas fa-folder" />
                Show Widgets Folder
            </Button>
        </>
    );
}
