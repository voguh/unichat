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

export const AccordionItemStyledContainer = styled.div({
    ...tw`bg-stone-800 rounded overflow-hidden`,

    "> .accordion-header": {
        ...tw`flex items-center gap-2 cursor-pointer px-4 py-2`,

        "> .accordion-title": {
            ...tw`flex-1 flex items-center gap-2 text-lg`
        },

        "> .accordion-aside": {
            ...tw`flex items-center gap-2`
        }
    },

    "> .accordion-content": {
        ...tw`px-4 py-2 border-t border-t-stone-600 pt-2`
    }
});
