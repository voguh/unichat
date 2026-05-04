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

import { keyframes, styled } from "goober";
import tw, { TwStyle } from "twin.macro";

export type ToastType = "success" | "info" | "error" | "warn" | "default";

const entryAnimation = keyframes({
    from: {
        opacity: 0,
        transform: "translateY(20px)"
    },
    to: {
        opacity: 1,
        transform: "translateY(0)"
    }
});

const exitAnimation = keyframes({
    from: {
        opacity: 1,
        transform: "translateY(0)"
    },
    to: {
        opacity: 0,
        transform: "translateY(20px)"
    }
});

interface Props extends HTMLAttributes<HTMLDivElement> {
    type?: ToastType;
}

export const ToastStyledContainer: ComponentType<Props> = styled.div(({ type }: Props) => {
    const variantStyles: Record<ToastType, TwStyle> = {
        success: tw`bg-[color-mix(in srgb, _theme(colors.green.700), _theme(colors.stone.950) 75%)] border border-green-700/25`,
        info: tw`bg-[color-mix(in srgb, _theme(colors.blue.700), _theme(colors.stone.950) 75%)] border border-blue-700/25`,
        error: tw`bg-[color-mix(in srgb, _theme(colors.rose.700), _theme(colors.stone.950) 75%)] border border-rose-700/25`,
        warn: tw`bg-[color-mix(in srgb, _theme(colors.yellow.700), _theme(colors.stone.950) 75%)] border border-yellow-700/25`,
        default: tw`bg-[color-mix(in srgb, _theme(colors.gray.700), _theme(colors.stone.950) 75%)] border border-gray-700/25`
    };

    return {
        ...variantStyles[type ?? "default"],
        ...tw`text-stone-50 rounded shadow-lg p-4 cursor-pointer`,
        animation: `${entryAnimation} 250ms ease-out`,

        "&.toast--exit": {
            animation: `${exitAnimation} 250ms ease-in forwards`
        },

        ".toast--header": {
            ...tw`flex justify-start items-center gap-2 mb-3`,

            ".toast--icon": {
                ...tw`w-[25px] h-[25px] bg-white/10 flex justify-center items-center rounded`
            },

            ".toast--title": {
                ...tw`font-semibold`
            }
        },

        ".toast--body": {}
    };
});
