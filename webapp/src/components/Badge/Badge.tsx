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

export type BadgeVariant = Variants;

interface Props extends PReact.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    children: PReact.ComponentChildren;
}

export function Badge({ variant: bg, children, style, ...props }: Props): PReact.ComponentChildren {
    function formatBackgroundColor(color: BadgeVariant | undefined): TwStyle {
        switch (color) {
            case "primary":
                return tw`bg-red-800/50 border border-red-800 text-stone-50`;
            case "secondary":
                return tw`bg-zinc-700/50 border border-zinc-700 text-stone-50`;
            case "success":
                return tw`bg-green-700/50 border border-green-700 text-stone-50`;
            case "danger":
                return tw`bg-rose-700/50 border border-rose-700 text-stone-50`;
            case "warning":
                return tw`bg-yellow-700/50 border border-yellow-700 text-stone-50`;
            case "info":
                return tw`bg-blue-700/50 border border-blue-700 text-stone-50`;
            default:
                return tw`bg-zinc-700/50 border border-zinc-700 text-stone-50`;
        }
    }

    function mergeStyles(
        ...styles: (TwStyle | PReact.Signalish<string | PReact.CSSProperties | undefined>)[]
    ): PReact.CSSProperties {
        return Object.assign({}, ...styles);
    }

    return (
        <BadgeStyledContainer {...props} style={mergeStyles(formatBackgroundColor(bg), style)}>
            {children}
        </BadgeStyledContainer>
    );
}
