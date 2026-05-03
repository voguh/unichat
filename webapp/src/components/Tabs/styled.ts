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
        ...tw`flex border-b border-gray-300 dark:border-gray-700`,

        "> .tab-list--tab": {
            ...tw`px-4 py-2 cursor-pointer text-gray-600 dark:text-gray-300`,

            "&.tab-list--tab-selected": {
                ...tw`border-b-2 border-blue-500 text-blue-500 dark:text-blue-400`
            }
        }
    },

    "> .tabs--content": {
        ...tw`flex-1 p-4 overflow-auto`
    }
});
