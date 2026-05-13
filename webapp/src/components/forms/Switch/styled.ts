/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, LabelHTMLAttributes } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const StyledInputWrapper: ComponentType<LabelHTMLAttributes<HTMLLabelElement>> = styled.label({
    "> input": {
        ...tw`absolute opacity-0 w-0 h-0`
    },

    "> div": {
        ...tw`relative bg-stone-800/90 border border-stone-800 rounded cursor-pointer`,
        height: "18px",
        width: "36px",
        borderRadius: "9px",

        "&::after": {
            ...tw`bg-white`,
            content: "''",
            position: "absolute",
            top: "50%",
            left: "2px",
            transform: "translateY(-50%)",
            width: "14px",
            height: "14px",
            borderRadius: "50%"
        }
    },

    "> input:checked + div": {
        ...tw`bg-blue-600 border-blue-600`,

        "&::after": {
            left: "calc(100% - 2px)",
            transform: "translate(-100%, -50%)"
        }
    }
});
