/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, InputHTMLAttributes } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const StyledInput: ComponentType<InputHTMLAttributes<HTMLInputElement>> = styled.input({
    ...tw`relative w-full py-2 px-3 rounded border text-stone-50 border-stone-800 bg-stone-800/90 transition-colors duration-150`,
    height: "36px",
    outline: "none",

    "&::placeholder": {
        ...tw`text-stone-500`
    },

    "&:focus": {
        ...tw`border-stone-700`
    },

    "&:hover": {
        ...tw`border-stone-700`
    },

    "&:disabled": {
        ...tw`cursor-not-allowed border-stone-700 bg-stone-700/50 text-stone-500`
    }
});
