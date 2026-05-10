/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ButtonHTMLAttributes, ComponentType } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const ButtonStyledContainer: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>> = styled.button({
    ...tw`px-4 py-2 rounded bg-stone-900 border border-stone-700 text-stone-50 flex justify-center items-center gap-2 font-semibold`,
    height: "36px",

    "&:hover:not(:disabled)": {
        ...tw`bg-stone-800 border-stone-700`
    },

    "&[data-variant=primary]": {
        ...tw`bg-red-800 text-stone-50 border-red-800`,

        "&:hover:not(:disabled)": {
            ...tw`bg-red-900 border-red-900`
        }
    },

    "&[data-variant=secondary]": {
        ...tw`bg-zinc-700 text-stone-50 border-zinc-700`,

        "&:hover:not(:disabled)": {
            ...tw`bg-zinc-800 border-zinc-800`
        }
    },

    "&[data-variant=success]": {
        ...tw`bg-green-700 text-stone-50 border-green-700`,

        "&:hover:not(:disabled)": {
            ...tw`bg-green-800 border-green-800`
        }
    },

    "&[data-variant=danger]": {
        ...tw`bg-rose-700 text-stone-50 border-rose-700`,

        "&:hover:not(:disabled)": {
            ...tw`bg-rose-800 border-rose-800`
        }
    },

    "&[data-variant=warning]": {
        ...tw`bg-yellow-500 text-black border-yellow-500`,

        "&:hover:not(:disabled)": {
            ...tw`bg-yellow-600 border-yellow-600`
        }
    },

    "&[data-variant=info]": {
        ...tw`bg-cyan-700 text-stone-50 border-cyan-700`,

        "&:hover:not(:disabled)": {
            ...tw`bg-cyan-800 border-cyan-800`
        }
    },

    "&:disabled": {
        ...tw`bg-stone-700 border-stone-700 text-stone-500 cursor-not-allowed`
    }
});
