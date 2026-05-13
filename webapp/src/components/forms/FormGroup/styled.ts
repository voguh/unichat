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

export const inputGeneralStyle = {
    ...tw`relative w-full py-2 px-3 outline-none rounded border border-stone-800 bg-stone-800/90 text-stone-50`,
    height: "36px",

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
};

export const FormGroupStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full`,

    "> label": {
        ...tw`block mb-1 font-medium text-stone-300`
    },

    "> .form-description": {
        ...tw`block mb-1 text-sm text-stone-500`
    },

    /* ====================================================================== */

    "> .ColorPicker-container": {
        ...tw`relative w-full`,

        "> input": {
            ...inputGeneralStyle
        }
    },

    "> .GalleryFileInput-container": {
        ...tw`relative w-full`,

        "> input": {
            ...inputGeneralStyle
        }
    },

    "> .NumberInput-container": {
        ...tw`relative w-full`,

        "> input": {
            ...inputGeneralStyle
        }
    },

    "> .Select-container": {
        ...tw`relative w-full`,

        "> input": {
            ...inputGeneralStyle
        }
    },

    "> .Switch-container": {
        ...tw`relative w-full`
    },

    "> .Textarea-container": {
        ...tw`relative w-full`,

        "> textarea": {
            ...inputGeneralStyle,
            height: "auto"
        }
    },

    "> .TextInput-container": {
        ...tw`relative w-full`,

        "> input": {
            ...inputGeneralStyle
        }
    },

    /* ====================================================================== */

    "> .form-error": {
        ...tw`block mt-1 text-sm text-red-600`
    }
});
