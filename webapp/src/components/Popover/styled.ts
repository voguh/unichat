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

export const PopoverStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`bg-stone-900 text-stone-50 border border-stone-700 p-4 rounded text-sm pointer-events-none`,

    "&::after": {
        ...tw`absolute border-l border-b bg-inherit border-inherit`,
        content: '""',
        width: "8px",
        height: "8px",
        boxSizing: "border-box"
    },
    "&[data-placement^='top']::after": {
        bottom: "-4px",
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)"
    },
    "&[data-placement^='bottom']::after": {
        top: "-4px",
        left: "50%",
        transform: "translateX(-50%) rotate(135deg)"
    },
    "&[data-placement^='left']::after": {
        right: "-4px",
        top: "50%",
        transform: "translateY(-50%) rotate(-135deg)"
    },
    "&[data-placement^='right']::after": {
        left: "-4px",
        top: "50%",
        transform: "translateY(-50%) rotate(45deg)"
    },

    "> .popover-header": {
        ...tw`font-bold mb-1`
    },

    "> .popover-body": {
        ...tw`text-sm`
    }
});
