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

export const TabsStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full h-full flex flex-col`,

    "> .tabs--tab-list": {
        ...tw`m-2 w-fit flex p-1 bg-stone-950/50 rounded`,

        "> .tab-list--tab": {
            ...tw`px-3 py-1 rounded-sm cursor-pointer text-stone-50`,

            "&[data-selected='true']": {
                ...tw`font-semibold bg-blue-500/50`
            }
        }
    },

    "> .tabs--content": {
        ...tw`flex-1 p-4 overflow-auto`
    }
});
