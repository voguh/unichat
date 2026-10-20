/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
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
import { useStorage } from "unichat/hooks/useStorage";
import { commandService } from "unichat/services/commandService";
import { StorageKeys } from "unichat/services/storageService";

export function DashboardLeftSection(): PReact.ComponentChildren {
    const [showWidgetPreview, setShowWidgetPreview] = useStorage(StorageKeys.SHOW_WIDGET_PREVIEW);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    return (
        <>
            <Tooltip.Root positioning={{ placement: "right" }}>
                <Tooltip.Trigger asChild>
                    <Button variant="secondary" onClick={handleClearChat} data-tour="clear-chat">
                        <i className="fas fa-eraser" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Clear chat history</Tooltip.Content>
            </Tooltip.Root>
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
                    <Button
                        variant={showWidgetPreview ? "secondary" : undefined}
                        onClick={() => setShowWidgetPreview((old) => !old)}
                        data-tour="toggle-widget-preview"
                    >
                        {showWidgetPreview ? <i className="fas fa-eye" /> : <i className="fas fa-eye-slash" />}
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Toggle widget preview</Tooltip.Content>
            </Tooltip.Root>
        </>
    );
}
