/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { styled } from "goober";
import tw from "twin.macro";

export const MarkdownStyledContainer = styled.div({
    "> :first-child": {
        ...tw`mt-0`
    },

    a: {
        ...tw`text-red-600`
    },

    code: {
        ...tw`bg-stone-900 text-stone-50 rounded font-mono px-2 py-1`,

        "&::before, &::after": {
            display: "none"
        }
    },

    ul: {
        "> li": {
            ...tw`my-0`,

            "> *": {
                ...tw`my-0`
            }
        }
    },

    table: {
        ...tw`w-auto border border-stone-700 border-collapse bg-stone-900`,

        "> thead": {
            "> tr": {
                ...tw`bg-stone-900 font-bold`,

                "> th": {
                    ...tw`px-4 py-2 border border-stone-700`
                }
            }
        },

        "> tbody": {
            "> tr": {
                "&:nth-child(odd)": {
                    ...tw`bg-stone-700/50`
                },

                "&:nth-child(even)": {
                    ...tw`bg-stone-700/25`
                },

                "> td": {
                    ...tw`px-4 py-2 border border-stone-700`
                }
            }
        }
    }
});
