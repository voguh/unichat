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

export const EmulatorStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`flex flex-col gap-4 p-4`,

    "> .emulator--header": {
        ...tw`w-full text-center text-lg font-bold`
    },

    "> .emulator--operation-mode-select": {
        ...tw`flex justify-center items-end gap-2`
    },

    "> .emulator--events-dispatcher": {
        "> .emulator--button_group": {
            ...tw`flex flex-col bg-stone-700 rounded`,
            padding: "1px",
            gap: "1px",

            "> button": {
                ...tw`rounded-none border-0`,

                "&:first-child": {
                    ...tw`rounded-t`
                },

                "&:last-child": {
                    ...tw`rounded-b`
                }
            }
        }
    }
});
