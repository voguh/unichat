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

export const ThirdPartyLicensesStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    "> table": {
        ...tw`w-full border-collapse`,

        "> thead": {
            ...tw`bg-stone-950`,

            "> tr": {
                "> th": {
                    ...tw`text-left px-4 py-2 border-b border-stone-700`
                }
            }
        },

        "> tbody": {
            "> tr": {
                ...tw`bg-stone-900`,

                "&:nth-child(even)": {
                    ...tw`bg-stone-800`
                },

                "&.withLink": {
                    cursor: "pointer"
                },

                "> td": {
                    ...tw`px-4 py-2 border-b border-stone-700`,

                    "> span": {
                        ...tw`flex items-center gap-2`
                    }
                }
            }
        }
    }
});
