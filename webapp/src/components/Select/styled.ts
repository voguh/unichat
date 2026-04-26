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

export const SelectStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`relative w-full`,

    "> .input-container": {
        ...tw`relative w-full rounded border border-stone-800 bg-stone-800/90`,
        height: "40px",

        "> input": {
            ...tw`w-full py-2 pl-3 pr-10 bg-transparent border-none text-white cursor-pointer transition-colors duration-150`,
            height: "40px",
            marginRight: "40px"
        },

        "> .dropdown-indicator": {
            position: "absolute",
            top: 0,
            right: 0,
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
        },

        "&::placeholder": {
            ...tw`text-stone-500`
        },

        "&:focus": {
            ...tw`border-stone-700`
        },

        "&:hover": {
            ...tw`border-stone-700`
        },

        "&[data-focused='true']": {
            ...tw`border-stone-700`
        }
    }
});

export const SelectStyledDropdown: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full rounded border border-stone-700 bg-stone-800/95 shadow-xl overflow-auto backdrop-blur-sm`,

    maxHeight: "calc(32px * 6)",
    padding: "6px"
});

export const SelectStyledGroupContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full`,

    "> .group-label": {
        ...tw`px-2 py-1 text-xs font-semibold uppercase tracking-wider text-stone-400`
    },

    "> .group-items": {
        ...tw`w-full pl-2`
    }
});

export const SelectStyledOption: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full rounded px-2 py-1.5 cursor-pointer text-stone-100 transition-colors duration-150`,

    "&[data-selected='true']": {
        ...tw`bg-stone-600 text-white`
    },

    "&:hover": {
        ...tw`bg-stone-700`
    }
});
