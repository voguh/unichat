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

export const FieldsStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    "--unichat-fields-header-height": "46px", // 32px for button + 2 * 0.5rem (p-2)
    "--unichat-fields-content-height":
        "calc(var(--unichat-widget_editor-content-height) - var(--unichat-fields-header-height))",

    ...tw`relative`,
    height: "var(--unichat-widget_editor-content-height)",

    "> .fields--header": {
        ...tw`w-full p-2 flex justify-between items-center`,
        height: "var(--unichat-fields-header-height)",

        "> span": {
            ...tw`text-lg font-bold`
        },

        "> .fields--actions": {
            ...tw`flex gap-2`,

            "> button": {
                ...tw`py-0 px-2 flex justify-center items-center`,
                minWidth: "32px",
                height: "32px"
            }
        }
    },

    "> .fields--content": {
        ...tw`w-full p-2 flex flex-col overflow-y-auto`,
        height: "var(--unichat-fields-content-height)",

        "> .empty-fields": {
            ...tw`w-full h-full flex flex-col justify-center items-center gap-2 text-stone-50/50`
        },

        "> .accordion-item": {
            ...tw`rounded-none shrink-0`,

            "&:nth-child(1)": {
                ...tw`rounded-t`
            },

            "&:last-child": {
                ...tw`rounded-b`
            },

            "> .accordion-content": {
                ...tw`bg-stone-700/25 p-2 flex flex-col gap-4`,

                "> .form-group": {
                    "> .form-description": {
                        ...tw`text-stone-50/50`
                    }
                }
            }
        }
    }
});
