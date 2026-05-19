/*!******************************************************************************
 * Copyright (c) 2026 Voguh
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

export const SettingsModalStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    position: "relative",
    display: "flex",
    flexWrap: "nowrap",
    padding: "0 !important",
    height: "var(--modal-body-max-height)",

    "> .settings_modal--sidebar": {
        ...tw`bg-stone-900 border-r border-stone-800`,

        width: "201px", // 200px is the sidebar + 1px is the border
        height: "var(--modal-body-max-height)",

        "> .settings_modal--sidebar_items": {
            ...tw`p-2 flex flex-col gap-1`,
            height: "calc(var(--modal-body-max-height) - 46px)" // 46px is the footer
        },

        "> .settings_modal--sidebar_footer": {
            ...tw`p-4 text-center text-sm text-stone-500`
        }
    },

    "> .settings_modal--content": {
        "--settings-modal-content-width": "calc(var(--modal-body-max-width) - 201px)", // 201px is the sidebar
        "--settings-modal-content-height": "var(--modal-body-max-height)",

        ...tw`bg-stone-900`,
        width: "var(--settings-modal-content-width)",
        height: "var(--settings-modal-content-height)"
    }
});
