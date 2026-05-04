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
import tw, { TwStyle } from "twin.macro";

export type Position =
    | "top-left"
    | "top-center"
    | "top-right"
    | "right"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left"
    | "left";

interface Props extends HTMLAttributes<HTMLDivElement> {
    position: Position;
}

export const NotificationProviderStyledContainer: ComponentType<Props> = styled.div((props: Props) => {
    const placement: Record<Position, TwStyle> = {
        "top-left": tw`top-0 left-0`,
        "top-center": tw`top-0 left-1/2 -translate-x-1/2`,
        "top-right": tw`top-0 right-0`,

        right: tw`top-1/2 right-0 -translate-y-1/2`,

        "bottom-right": tw`bottom-0 right-0`,
        "bottom-center": tw`bottom-0 left-1/2 -translate-x-1/2`,
        "bottom-left": tw`bottom-0 left-0`,

        left: tw`top-1/2 left-0 -translate-y-1/2`
    };

    return {
        ...tw`fixed z-[9999] m-2 flex flex-col gap-2`,
        ...placement[props.position]
    };
});
