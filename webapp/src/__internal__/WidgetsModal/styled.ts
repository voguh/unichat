/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { styled } from "goober";
import tw from "twin.macro";

export const WidgetsStyledTable = styled.table({
    "--cell-padding-x": "8px",
    "--cell-padding-y": "8px",
    "--cell-inner-min-width": "30px",
    "--cell-inner-height": "30px",
    "--cell-min-width": "calc(var(--cell-inner-min-width) + var(--cell-padding-x) * 2)",
    "--cell-height": "calc(var(--cell-inner-height) + var(--cell-padding-y) * 2)",

    ...tw`w-full border-collapse table-fixed`,

    "> tbody": {
        "> tr": {
            "&:nth-child(odd)": {
                ...tw`bg-stone-600/25`
            },

            "&:nth-child(even)": {
                ...tw`bg-stone-700/25`
            },

            "> td": {
                height: "var(--cell-height)",
                minWidth: "var(--cell-min-width)",
                padding: "var(--cell-padding-y) var(--cell-padding-x)",
                textAlign: "left",

                "&.widget-name": {
                    verticalAlign: "middle",

                    "> span": {
                        ...tw`font-semibold whitespace-nowrap overflow-hidden text-ellipsis`
                    }
                },

                "&.plugin-actions": {
                    width: "calc(127px + var(--cell-padding-x) * 2)",

                    "> div": {
                        ...tw`flex justify-end items-center gap-2`,

                        "> button": {
                            ...tw`py-0 px-4 flex justify-center items-center gap-2`,
                            whiteSpace: "nowrap",
                            height: "30px"
                        }
                    }
                }
            }
        }
    }
});
