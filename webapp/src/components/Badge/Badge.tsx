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

interface Props extends PReact.HTMLAttributes<HTMLDivElement> {
    bg?: Variants;
    children: PReact.ComponentChildren;
}

export function Badge({ bg, children, style, ...props }: Props): PReact.ComponentChildren {
    function formatBackgroundColor(color: string | undefined): TwStyle {
        switch (color) {
            case "primary":
                return tw`bg-red-800/50 border border-red-800 text-white`;
            case "secondary":
                return tw`bg-zinc-700/50 border border-zinc-700 text-white`;
            case "success":
                return tw`bg-green-700/50 border border-green-700 text-white`;
            case "danger":
                return tw`bg-rose-700/50 border border-rose-700 text-white`;
            case "warning":
                return tw`bg-yellow-700/50 border border-yellow-700 text-white`;
            case "info":
                return tw`bg-blue-700/50 border border-blue-700 text-white`;
            default:
                return tw`bg-stone-700/50 border border-stone-700 text-white`;
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
