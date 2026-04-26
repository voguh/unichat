/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { styled } from "goober";
import tw from "twin.macro";

export const TooltipStyledContainer = styled.div({
    ...tw`bg-stone-900 text-white border border-stone-700 py-1 px-2 rounded text-sm pointer-events-none relative shadow-lg`,
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
        transform: "translateX(-50%) rotate(45deg)"
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
    }
});
