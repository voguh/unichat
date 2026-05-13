/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, HTMLAttributes } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const WidgetEditorStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    "> .widget_editor--header": {
        ...tw`relative bg-stone-900 border-b border-stone-800 p-2 flex gap-2`,

        "> button": {
            ...tw`p-0 flex justify-center items-center shrink-0`,
            width: "36px",
            height: "36px"
        }
    },

    "> .widget_editor--content": {
        "--unichat-widget_editor-content-height": "calc(100vh - 51px)", // 51px for header
        "--unichat-widget_editor-preview-width": "402px",

        height: "var(--unichat-widget_editor-content-height)",
        display: "grid",
        gridTemplateColumns: "300px var(--unichat-widget_editor-preview-width) 1fr",

        "> .widget_editor--fields": {
            height: "var(--unichat-widget_editor-content-height)",
            overflowY: "auto"
        },

        "> .widget_editor--preview": {
            "--unichat-widget_editor-preview-inner-width": "calc(var(--unichat-widget_editor-preview-width) - 2px)",
            "--unichat-widget_editor-preview-inner-height": "calc(100vh - 51px)",

            ...tw`relative bg-stone-900 border-x border-stone-800`,
            gridColumn: "2",
            width: "var(--unichat-widget_editor-preview-width)",
            height: "var(--unichat-widget_editor-preview-inner-height)",

            "> iframe": {
                width: "100%",
                height: "100%",
                border: "none",
                pointerEvents: "none",
                background: "white"
            }
        }
    }
});
