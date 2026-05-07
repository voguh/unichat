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

export const PluginsStyledContainer = styled.div({
    ...tw`relative`,

    "> table": {
        ...tw`w-full border-collapse table-fixed`,

        "> tbody": {
            "> tr": {
                "&:nth-child(odd)": {
                    ...tw`bg-stone-950/25`
                },

                "&:nth-child(even)": {
                    ...tw`bg-stone-950/50`
                },

                "> td": {
                    ...tw`w-fit p-2`,

                    "&.plugin-icon": {
                        ...tw`w-[calc(_theme(padding.2) * 2 + 36px)]`,

                        "> img": {
                            ...tw`object-cover rounded`,
                            width: "36px",
                            height: "36px"
                        }
                    },

                    "&.plugin-name": {},

                    "&.plugin-badges": {
                        ...tw`w-fit`,

                        "> div": {
                            ...tw`flex flex-nowrap gap-1 justify-end items-center`,
                            height: "36px"
                        }
                    },

                    "&.plugin-actions": {
                        ...tw`w-[calc(_theme(padding.2) * 2 + 77px)]`
                    }
                }
            }
        }
    }
});
