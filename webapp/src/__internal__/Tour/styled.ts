/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, HTMLAttributes } from "preact";

import { styled } from "goober";
import tw, { theme } from "twin.macro";

export const TourStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    "> .tour-container": {
        "> .tour-backdrop": {
            ...tw`fixed inset-0 bg-black/50 backdrop-blur-sm`
        },

        "> .tour-highlight": {
            ...tw`fixed bg-transparent border-2 border-red-800 rounded`,
            boxShadow: `0 0 8px color-mix(in srgb, ${theme`colors.red.800`}, transparent 75%)`
        },

        "> .tour-dialog": {
            ...tw`fixed bg-stone-950 p-2 rounded shadow-lg text-center border border-stone-700`,
            visibility: "hidden",
            opacity: 0,
            maxWidth: "min(80vw, 320px)",

            "> .tour-dialog-caret": {
                ...tw`fixed bg-stone-950 border-l border-b border-stone-700`,
                width: "8px",
                height: "8px",

                "&[data-placement^='top']": {
                    transform: "translate(-50%, calc((100% + 4px) * -1)) rotate(-45deg)"
                },
                "&[data-placement^='bottom']": {
                    transform: "translate(-50%, 4px) rotate(135deg)"
                },
                "&[data-placement^='left']": {
                    transform: "translate(calc((100% + 4px) * -1), -50%) rotate(-135deg)"
                },
                "&[data-placement^='right']": {
                    transform: "translate(4px, -50%) rotate(45deg)"
                }
            },

            "> .tour-dialog-title": {
                ...tw`font-semibold mb-1`
            },

            "> .tour-dialog-subtitle": {
                ...tw`text-sm text-stone-300 border-t border-stone-700 mx-1 pt-1 mt-1`
            }
        }
    },

    "> .tour-actions": {
        ...tw`fixed`,
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px",

        "> tour-prev, > tour-next": {}
    },

    "> .tour-skip, > .tour-end": {
        ...tw`fixed`,
        bottom: "calc(16px + 36px + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "8px"
    }
});
