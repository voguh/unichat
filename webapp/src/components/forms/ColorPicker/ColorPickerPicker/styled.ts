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

export const ColorPickerPickerStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`bg-stone-900 border border-stone-700 rounded p-2 shadow`,
    width: "233px",
    userSelect: "none",

    "> .color_picker-main": {
        ...tw`relative`,

        "> .color_picker-box": {
            ...tw`relative rounded cursor-crosshair overflow-hidden`,
            height: "150px",

            "> .color_picker-box-white": {
                ...tw`absolute inset-0`,
                background: "linear-gradient(to right, white, transparent)"
            },

            "> .color_picker-box-black": {
                ...tw`absolute inset-0`,
                background: "linear-gradient(to top, black, transparent)"
            },

            "> .color_picker-box-handle": {
                ...tw`absolute border border-white rounded-full shadow`,
                width: "12px",
                height: "12px",
                transform: "translate(-50%, -50%)"
            }
        },

        "> .color_picker-slider": {
            ...tw`relative h-4 rounded mt-2 cursor-pointer`,
            width: "calc(100% - 3rem)",

            "> .color_picker-slider-handle": {
                ...tw`absolute h-5 w-2 bg-stone-50/25 border border-white rounded shadow`,
                top: "50%",
                transform: "translate(-50%, -50%)"
            }
        },

        "> .color_picker-hue": {
            background:
                "linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%);"
        },

        "> .color_picker-alpha": {
            "> .color_picker-slider-alpha_bg": {
                ...tw`absolute inset-0 rounded`,

                backgroundImage:
                    "linear-gradient(45deg, #a8a29e 25%, transparent 25%), linear-gradient(-45deg, #a8a29e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #a8a29e 75%), linear-gradient(-45deg, transparent 75%, #a8a29e 75%)",
                backgroundSize: "1rem 1rem",
                backgroundPosition: "0 0, 0 0.5rem, 0.5rem -0.5rem, -0.5rem 0px"
            },

            "> .color_picker-slider-alpha_gradient": {
                ...tw`absolute inset-0 rounded`,
                background: "linear-gradient(to right, transparent, rgba(0, 0, 0, 0.5), black)"
            }
        },

        "> .color_picker-preview": {
            ...tw`absolute flex-shrink-0 rounded border border-stone-800 overflow-hidden`,
            right: "0",
            bottom: "0",
            width: "2.5rem",
            height: "2.5rem",

            "> .color_picker-preview-checkerboard": {
                ...tw`absolute inset-0`,
                backgroundImage:
                    "linear-gradient(45deg, #a8a29e 25%, transparent 25%), linear-gradient(-45deg, #a8a29e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #a8a29e 75%), linear-gradient(-45deg, transparent 75%, #a8a29e 75%)",
                backgroundSize: "1rem 1rem",
                backgroundPosition: "0 0, 0 0.5rem, 0.5rem -0.5rem, -0.5rem 0px"
            },

            "> .color_picker-preview-color": {
                ...tw`absolute inset-0`
            }
        }
    },

    "> .color_picker-swatches": {
        ...tw`flex flex-wrap gap-2 mt-2`,

        "> .color_picker-swatch": {
            ...tw`w-6 h-6 rounded cursor-pointer border border-stone-700`,
            flexShrink: 0
        }
    }
});
