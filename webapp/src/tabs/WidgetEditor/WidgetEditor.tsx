/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useRef, useState } from "preact/hooks";

import { Button } from "unichat/components/Button";
import { Select } from "unichat/components/forms/Select";
import { Tooltip } from "unichat/components/Tooltip";
import { useWidgets } from "unichat/hooks/useWidgets";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { commandService } from "unichat/services/commandService";
import { notificationService } from "unichat/services/notificationService";
import { WIDGET_URL_PREFIX } from "unichat/utils/constants";
import { Strings } from "unichat/utils/Strings";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { Emulator } from "./Emulator";
import { Fields } from "./Fields";
import { WidgetEditorStyledContainer } from "./styled";

const _logger = LoggerFactory.getLogger("WidgetEditor");
export function WidgetEditor(): PReact.ComponentChildren {
    const [selectedWidget, setSelectedWidget] = useState<string>("default");

    const [widgets, reloadWidgets] = useWidgets((ws) => new Map(ws.map((w) => [w.restPath, w])), new Map());
    const iframeRef = useRef<HTMLIFrameElement>(null);

    /* ====================================================================== */

    async function reloadIframe(): Promise<void> {
        await reloadWidgets();

        if (iframeRef.current) {
            iframeRef.current.src = `${WIDGET_URL_PREFIX}/${selectedWidget}`;
            // handleFetchWidgetData();
        }
    }

    async function handleApply(fieldState: Record<string, unknown>): Promise<void> {
        try {
            if (!Strings.isNullOrEmpty(selectedWidget)) {
                await commandService.setWidgetFieldState(selectedWidget, fieldState);
                reloadIframe();
                notificationService.success({ title: "Success", message: "Widget field state applied." });
            }
        } catch (err) {
            _logger.error("An error occurred on save 'fieldstate.json'", err);
            notificationService.error({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`
            });
        }
    }

    async function handleReset(): Promise<void> {
        try {
            if (!Strings.isNullOrEmpty(selectedWidget)) {
                await commandService.setWidgetFieldState(selectedWidget, {});
                reloadIframe();
                notificationService.success({ title: "Success", message: "Widget field state reset." });
            }
        } catch (err) {
            _logger.error("An error occurred on save 'fieldstate.json'", err);
            notificationService.error({
                title: "Error",
                message: `Failed to apply widget field state: ${(err as Error).message}`
            });
        }
    }

    return (
        <WidgetEditorStyledContainer>
            <div className="widget_editor--header">
                <Select
                    value={selectedWidget}
                    options={toWidgetOptionGroup(widgets.values())}
                    onChange={(evt) => setSelectedWidget(evt.currentTarget.value)}
                />

                <Tooltip content="Reload widget view" placement="left">
                    <Button onClick={reloadIframe}>
                        <i className="fas fa-sync" />
                    </Button>
                </Tooltip>
            </div>

            <div className="widget_editor--content">
                <div className="widget_editor--fields">
                    <Fields
                        handleApply={handleApply}
                        handleReset={handleReset}
                        selectedWidget={selectedWidget}
                        widgets={widgets}
                    />
                </div>
                <div className="widget_editor--preview">
                    <iframe ref={iframeRef} src={`${WIDGET_URL_PREFIX}/${selectedWidget}`} sandbox="allow-scripts" />
                </div>
                <div className="widget_editor--emulator">
                    <Emulator iframeRef={iframeRef} />
                </div>
            </div>
        </WidgetEditorStyledContainer>
    );
}
