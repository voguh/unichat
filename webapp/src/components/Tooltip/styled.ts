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

export const TooltipStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`bg-stone-900 text-stone-50 border border-stone-700 py-1 px-2 rounded pointer-events-none`,

    "> .tooltip-caret": {
        ...tw`fixed bg-inherit border-l border-b border-inherit`,
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

    "> .tooltip-content": {
        ...tw`text-sm`
    }
});
