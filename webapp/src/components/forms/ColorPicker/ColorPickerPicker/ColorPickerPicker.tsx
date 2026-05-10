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
import { Dispatch, StateUpdater } from "preact/hooks";

import { HSVA, Numberify, TinyColor } from "@ctrl/tinycolor";

import { usePointerHandlers } from "unichat/hooks/usePointerHandlers";

import { ColorPickerPickerStyledContainer } from "./styled";

interface Props {
    hsv: Numberify<HSVA>;
    setHsv: Dispatch<StateUpdater<Numberify<HSVA>>>;
    swatches?: string[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function ColorPickerPicker({ hsv, setHsv, swatches }: Props): PReact.ComponentChildren {
    const opaqueColor = new TinyColor(hsv).toHexString();

    const boxHandlers = usePointerHandlers<HTMLDivElement>((event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const s = clamp(x / rect.width, 0, 1);
        const v = clamp(1 - y / rect.height, 0, 1);

        setHsv((old) => ({ ...old, s, v }));
    });

    const hueHandlers = usePointerHandlers<HTMLDivElement>((event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const x = clamp(event.clientX - rect.left, 0, rect.width);

        const h = (x / rect.width) * 360;

        setHsv((old) => ({ ...old, h }));
    });

    const alphaHandlers = usePointerHandlers<HTMLDivElement>((event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        const x = clamp(event.clientX - rect.left, 0, rect.width);

        const a = x / rect.width;

        setHsv((old) => ({ ...old, a }));
    });

    return (
        <ColorPickerPickerStyledContainer>
            <div className="color_picker-main">
                <div
                    {...boxHandlers}
                    className="color_picker-box"
                    style={{ backgroundColor: new TinyColor({ h: hsv.h, s: 1, v: 1 }).toHexString() }}
                >
                    <div className="color_picker-box-white" />
                    <div className="color_picker-box-black" />

                    <div
                        className="color_picker-box-handle"
                        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                    />
                </div>

                <div {...hueHandlers} className="color_picker-slider color_picker-hue">
                    <div className="color_picker-slider-handle" style={{ left: `${(hsv.h / 360) * 100}%` }} />
                </div>

                <div {...alphaHandlers} className="color_picker-slider color_picker-alpha">
                    <div className="color_picker-slider-alpha_bg" />
                    <div
                        className="color_picker-slider-alpha_gradient"
                        style={{ background: `linear-gradient(to right, transparent, ${opaqueColor})` }}
                    />
                    <div className="color_picker-slider-handle" style={{ left: `${hsv.a * 100}%` }} />
                </div>

                <div className="color_picker-preview">
                    <div className="color_picker-preview-checkerboard" />
                    <div
                        className="color_picker-preview-color"
                        style={{ backgroundColor: new TinyColor(hsv).toRgbString() }}
                    />
                </div>
            </div>
            <div className="color_picker-swatches">
                {Array.isArray(swatches) &&
                    swatches.map((color) => (
                        <div
                            key={color}
                            className="color_picker-swatch"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                const newColor = new TinyColor(color);
                                if (newColor.isValid) {
                                    setHsv(newColor.toHsv());
                                }
                            }}
                        />
                    ))}
            </div>
        </ColorPickerPickerStyledContainer>
    );
}
