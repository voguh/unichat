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
import tw, { theme } from "twin.macro";

export const ColorPickerStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`relative flex justify-center items-center gap-1`,

    "> .color-preview": {
        ...tw`relative flex-shrink-0 rounded border border-stone-50/25 overflow-hidden`,

        width: "36px",
        height: "36px",

        "> .color_picker-preview-checkerboard": {
            "--checkerboard-color": theme`colors.stone.400`,

            ...tw`absolute inset-0`,
            backgroundImage: `
                linear-gradient(45deg, var(--checkerboard-color) 25%, transparent 25%),
                linear-gradient(-45deg, var(--checkerboard-color) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, var(--checkerboard-color) 75%),
                linear-gradient(-45deg, transparent 75%, var(--checkerboard-color) 75%)
            `,
            backgroundSize: "1rem 1rem",
            backgroundPosition: "0 0, 0 0.5rem, 0.5rem -0.5rem, -0.5rem 0px"
        },

        "> .color_picker-preview-color": {
            ...tw`absolute inset-0`
        }
    }
});
