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

export const OptionRendererStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full rounded px-2 py-1.5 cursor-pointer text-stone-100 transition-colors duration-150`,

    "&[data-selected='true']": {
        ...tw`bg-stone-600 text-stone-50`
    },

    "&:hover": {
        ...tw`bg-stone-700`
    }
});
