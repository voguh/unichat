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

export const FormGroupStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full`,

    "> label": {
        ...tw`block mb-1 font-medium text-stone-300`
    },
    "> .form-description": {
        ...tw`block mb-1 text-sm text-stone-500`
    },
    "> .form-error": {
        ...tw`block mt-1 text-sm text-red-600`
    }
});
