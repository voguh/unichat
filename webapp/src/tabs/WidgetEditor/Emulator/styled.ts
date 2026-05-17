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
    ...tw`relative p-4`,
    height: "var(--unichat-widget_editor-content-height)",

    "> .emulator--header": {
        ...tw`w-full text-center text-lg font-bold`
    },

    "> .emulator--operation-mode-select": {
        ...tw`flex justify-center items-end gap-2 mt-2`
    },

    "> .emulator--events-dispatcher": {
        ...tw`mt-4`,

        "> .emulator--events-title": {
            ...tw`font-medium text-stone-300 mb-1`
        },

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
    },

    "> .emulator--emulation-target": {
        position: "absolute",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 2rem)",

        "> .emulator--target-title": {
            ...tw`font-medium text-stone-300 mb-1`
        },

        "> .form-description": {
            ...tw`block mb-1 text-sm text-stone-500`
        },

        "> .emulator--emulation-target-select": {
            ...tw`flex items-center gap-2`,

            "> div": {
                ...tw`flex justify-center items-center gap-2`,

                "> .form-group": {
                    width: "fit-content"
                },

                "&:nth-child(1)": {
                    ...tw`justify-end`
                },

                "&:nth-child(2)": {
                    width: "36px"
                },

                "&:nth-child(3)": {
                    ...tw`justify-start`
                }
            }
        }
    }
});
