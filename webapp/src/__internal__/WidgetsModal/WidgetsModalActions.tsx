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

import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@voguh/unichat-ui/Button";
import { useModalContext } from "unichat/hooks/useModalContext";

import { OtherWidgetsPopover } from "./OtherWidgetsPopover";
import type { WidgetsModalSharedStore } from "./WidgetsModal";

export function WidgetsModalActions(): PReact.ComponentChildren {
    const { sharedStore } = useModalContext<WidgetsModalSharedStore>();

    return (
        <>
            <Button
                variant="default"
                onClick={() => openUrl("https://unichat.voguh.me/docs/1.5.x/widgets/getting_started.html")}
            >
                <i className="fas fa-book" />
                Read the Docs
            </Button>
            <OtherWidgetsPopover communityWidgetNames={sharedStore.communityWidgetNames ?? []} />
        </>
    );
}
