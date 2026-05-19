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
    "--modal-width": "64rem",
    "--modal-inner-width": "calc(var(--modal-width) - 2px)", // 2px is the border
    "--modal-height": "90vh",
    "--modal-inner-height": "calc(var(--modal-height) - 2px)", // 2px is the border

    ...tw`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 rounded border border-stone-800`,
    width: "var(--modal-width)",
    maxHeight: "var(--modal-height)",

    "&[data-size=sm]": {
        "--modal-width": "24rem"
    },

    "&[data-size=md]": {
        "--modal-width": "32rem"
    },

    "&[data-size=lg]": {
        "--modal-width": "48rem"
    },

    "&[data-size=xl]": {
        "--modal-width": "64rem"
    },

    "&[data-size='fullscreen']": {
        "--modal-width": "100vw",
        "--modal-inner-width": "100vw",
        "--modal-height": "100vh",
        "--modal-inner-height": "100vh",

        ...tw`rounded-none border-none`
    },

    "> .modal-content": {
        width: "var(--modal-inner-width)",
        maxHeight: "var(--modal-inner-height)",

        "> .modal-header": {
            ...tw`flex justify-between items-center p-2 sticky top-0`,
            height: "43px",

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
            "--modal-body-max-width": "var(--modal-inner-width)",
            "--modal-body-max-height": "calc(var(--modal-inner-height) - 43px)", // 43px is the header height

            ...tw`p-4 text-stone-50 overflow-y-auto`,
            maxHeight: "var(--modal-body-max-height)"
        }
    }
});
