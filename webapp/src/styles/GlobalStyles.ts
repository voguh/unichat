/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import PReact from "preact";

import { createGlobalStyles } from "goober/global";
import tw from "twin.macro";

export const GlobalStyle = createGlobalStyles({
    "#root": {
        "--unichat-sidebar-width": "51px",

        display: "grid",
        gridTemplateColumns: "var(--unichat-sidebar-width) 1fr",
        gridTemplateRows: "1fr",
        gap: "8px",

        "> .sidebar": {
            "--unichat-sidebar-inner-width": "calc(var(--unichat-sidebar-width) - (0.5rem * 2 + 1px))", // 0.5rem padding + 1px border
            "--unichat-sidebar-padding": "0.5rem", // p-2

            ...tw`flex flex-col justify-between p-2 bg-stone-900 border-r border-stone-800`,
            gridColumn: "1",

            button: {
                ...tw`p-0 flex justify-center items-center`,
                width: "var(--unichat-sidebar-inner-width)",
                height: "var(--unichat-sidebar-inner-width)"
            },

            "> .sidebar__tabs": {
                ...tw`flex flex-col items-center gap-2`,

                "> .sidebar__left-section": {
                    ...tw`flex flex-col items-center gap-2`,

                    "> .sidebar__divider": {
                        ...tw`w-full border-t border-stone-700 my-2`
                    }
                }
            },

            "> .sidebar__footer": {
                ...tw`flex flex-col items-center gap-2`
            }
        },

        "> .content": {
            gridColumn: "2"
        }
    }
}) as PReact.ComponentType;
