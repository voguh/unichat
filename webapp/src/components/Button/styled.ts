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

import { Variants } from "unichat/types";

export type ButtonVariant = Variants | "default";

interface Props {
    variant: ButtonVariant;
}

export const ButtonStyledContainer = styled.button((props: Props) => {
    const styles = {
        ...tw`px-4 py-2 rounded focus:outline-none transition-colors duration-200 border border-stone-700 text-white flex justify-center items-center gap-2 font-semibold`,
        height: "36px",

        "&:hover": {
            ...tw`bg-stone-700 border-stone-700`
        }
    };

    switch (props.variant) {
        case "primary":
            return {
                ...styles,
                ...tw`bg-red-800 text-white border-red-800`,

                "&:hover": {
                    ...tw`bg-red-900 border-red-900`
                }
            };
        case "secondary":
            return {
                ...styles,
                ...tw`bg-zinc-700 text-white border-zinc-700`,

                "&:hover": {
                    ...tw`bg-zinc-800 border-zinc-800`
                }
            };
        case "success":
            return {
                ...styles,
                ...tw`bg-green-700 text-white border-green-700`,

                "&:hover": {
                    ...tw`bg-green-800 border-green-800`
                }
            };
        case "danger":
            return {
                ...styles,
                ...tw`bg-rose-700 text-white border-rose-700`,

                "&:hover": {
                    ...tw`bg-rose-800 border-rose-800`
                }
            };
        case "warning":
            return {
                ...styles,
                ...tw`bg-yellow-500 text-black border-yellow-500`,

                "&:hover": {
                    ...tw`bg-yellow-600 border-yellow-600`
                }
            };
        case "info":
            return {
                ...styles,
                ...tw`bg-cyan-700 text-white border-cyan-700`,

                "&:hover": {
                    ...tw`bg-cyan-800 border-cyan-800`
                }
            };
        default:
            return styles;
    }
});
