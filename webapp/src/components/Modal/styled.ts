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

export const ModalStyledBackdrop: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm`
});

export const ModalStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded border border-stone-800`,

    "> .modal-content": {
        maxHeight: "90vh",

        "> .modal-header": {
            ...tw`flex justify-between items-center p-2 sticky top-0`,

            "> .modal-title": {
                ...tw`text-lg font-semibold text-stone-100 flex-1 ml-2`
            },

            "> .modal-header-actions": {
                ...tw`ml-auto flex justify-center items-center gap-2`,

                "> button": {
                    ...tw`py-0 flex justify-center items-center`,
                    height: "28px"
                },

                "> .close-button": {
                    ...tw`p-0 flex justify-center items-center`,
                    width: "28px",
                    height: "28px"
                }
            },

            "&:not(:last-child)": {
                ...tw`border-b border-stone-800`
            }
        },

        "> .modal-body": {
            ...tw`p-4 text-stone-50`,
            maxHeight: "calc(90vh - 47px)"
        }
    },

    "&[data-size=sm]": {
        width: "24rem",
        maxHeight: "90vh"
    },

    "&[data-size=md]": {
        width: "32rem",
        maxHeight: "90vh"
    },

    "&[data-size=lg]": {
        width: "48rem",
        maxHeight: "90vh"
    },

    "&[data-size=xl]": {
        width: "64rem",
        maxHeight: "90vh"
    },

    "&[data-size='fullscreen']": {
        ...tw`w-screen h-screen rounded-none`,
        maxWidth: "100vw",
        maxHeight: "100vh",

        "> .modal-content": {
            maxHeight: "100vh",

            "> .modal-body": {
                maxHeight: "calc(100vh - 47px)"
            }
        }
    }
});
