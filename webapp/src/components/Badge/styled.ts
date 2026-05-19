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

export const BadgeStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`inline-flex items-center gap-1 rounded bg-zinc-800/50 border border-zinc-800 text-xs font-semibold text-stone-50 px-1 py-0.5`,

    "&[data-variant=primary]": {
        ...tw`bg-red-800/50 border-red-800`
    },

    "&[data-variant=secondary]": {
        ...tw`bg-zinc-700/50 border-zinc-700`
    },

    "&[data-variant=success]": {
        ...tw`bg-green-700/50 border-green-700`
    },

    "&[data-variant=danger]": {
        ...tw`bg-rose-700/50 border-rose-700`
    },

    "&[data-variant=warning]": {
        ...tw`bg-yellow-700/50 border-yellow-700`
    },

    "&[data-variant=info]": {
        ...tw`bg-blue-700/50 border-blue-700`
    }
});
