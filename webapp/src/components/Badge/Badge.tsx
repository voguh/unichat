/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";

import tw, { TwStyle } from "twin.macro";

import { Variants } from "unichat/types";

import { BadgeStyledContainer } from "./styled";

interface Props {
    bg?: Variants;
    children: PReact.ComponentChildren;
}

export function Badge({ bg, children }: Props): PReact.ComponentChildren {
    function formatBackgroundColor(color: string | undefined): TwStyle {
        switch (color) {
            case "primary":
                return tw`bg-red-800/75 border border-red-800 text-white`;
            case "secondary":
                return tw`bg-zinc-700/75 border border-zinc-700 text-white`;
            case "success":
                return tw`bg-green-700/75 border border-green-700 text-white`;
            case "danger":
                return tw`bg-rose-700/75 border border-rose-700 text-white`;
            case "warning":
                return tw`bg-yellow-700/75 border border-yellow-700 text-white`;
            case "info":
                return tw`bg-blue-700/75 border border-blue-700 text-white`;
            default:
                return tw`bg-stone-700/75 border border-stone-700 text-white`;
        }
    }
    return (
        <BadgeStyledContainer style={formatBackgroundColor(bg) as PReact.CSSProperties}>
            {children}
        </BadgeStyledContainer>
    );
}
