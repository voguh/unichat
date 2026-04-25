/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import PReact from "preact";
import { useContext } from "preact/hooks";

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "unichat/components/Button";
import { Tooltip } from "unichat/components/OverlayTrigger";
import { AppContext } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";

export function DashboardLeftSection(): PReact.ComponentChildren {
    const { showWidgetPreview, setShowWidgetPreview } = useContext(AppContext);

    async function handleClearChat(): Promise<void> {
        await commandService.dispatchClearChat();
    }

    return (
        <>
            <Tooltip content="Clear chat history" placement="right">
                <Button variant="secondary" onClick={handleClearChat} data-tour="clear-chat">
                    <i className="fas fa-eraser" />
                </Button>
            </Tooltip>
            <Tooltip content="Open user widgets folder" placement="right">
                <Button
                    variant="secondary"
                    onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}
                    data-tour="user-widgets-directory"
                >
                    <i className="fas fa-folder" />
                </Button>
            </Tooltip>
            <Tooltip content="Toggle widget preview" placement="right">
                <Button
                    onClick={() => setShowWidgetPreview((old) => !old)}
                    variant={showWidgetPreview ? "secondary" : undefined}
                    data-tour="toggle-widget-preview"
                >
                    {showWidgetPreview ? <i className="fas fa-eye" /> : <i className="fas fa-eye-slash" />}
                </Button>
            </Tooltip>
        </>
    );
}
