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
import { useEffect, useRef, useState } from "preact/hooks";

import { HSVA, Numberify, TinyColor } from "@ctrl/tinycolor";
import { flip, shift } from "@floating-ui/dom";

import { splitProperties } from "unichat/components/forms/__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "unichat/components/forms/FormGroup";
import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";
import { mergeRefs } from "unichat/utils/mergeRefs";

import { ColorPickerPicker } from "./ColorPickerPicker";
import { ColorPickerStyledContainer } from "./styled";

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "type" | "ref">;
export interface ColorPickerProps extends VanillaProps, FormGroupBaseProps {
    value?: string;
    defaultValue?: string;

    inputRef?: PReact.Ref<HTMLInputElement>;

    swatches?: string[];
}

function adjustFloatingPosition(reference: HTMLElement, floating: HTMLElement, x: number, y: number): [number, number] {
    const wrapperRect = reference.getBoundingClientRect();
    const centeredX = wrapperRect.left + window.scrollX + wrapperRect.width / 2;

    return [centeredX, y];
}

export function ColorPicker({ swatches, inputRef, id, ...props }: ColorPickerProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, inputProps] = splitProperties(props);

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(inputProps.value || inputProps.defaultValue || "");
    const [innerColor, setInnerColor] = useState<Numberify<HSVA>>(
        new TinyColor(inputProps.value || inputProps.defaultValue).toHsv()
    );

    const innerRef = useRef<HTMLInputElement>(null);
    const [wrapperRef, dropdownRef, updateVisualization] = useComputePosition<HTMLDivElement, HTMLDivElement>(
        { placement: "bottom", middleware: [flip(), shift({ padding: 8 })] },
        adjustFloatingPosition
    );

    function show(): void {
        setIsOpen(true);
        updateVisualization(true);
    }

    function hide(): void {
        setIsOpen(false);
        updateVisualization(false);
    }

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape") {
                hide();
            }
        }

        function handleClickOutside(event: Event): void {
            const wrapperEl = wrapperRef.current;
            const dropdownEl = dropdownRef.current;
            if (!wrapperEl || !dropdownEl) {
                return;
            }

            if (event.target instanceof Node && wrapperEl.contains(event.target)) {
                return;
            }

            if (event.target instanceof Node && dropdownEl.contains(event.target)) {
                return;
            }

            hide();
        }

        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("pointerdown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("pointerdown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        const inputEl = innerRef.current;
        if (document.activeElement === inputEl) {
            return;
        }

        const { r, g, b, a } = new TinyColor(innerColor).toRgb();
        const hexR = r.toString(16).padStart(2, "0");
        const hexG = g.toString(16).padStart(2, "0");
        const hexB = b.toString(16).padStart(2, "0");
        const alpha = Math.round(a * 255);
        const hexA = alpha > 255 ? alpha.toString(16).padStart(2, "0") : "";

        setInputValue(`#${hexR}${hexG}${hexB}${hexA}`);
    }, [innerColor]);

    useEffect(() => {
        const inputEl = innerRef.current;
        if (!inputEl) {
            return;
        }

        function sync(this: HTMLInputElement): void {
            const newColor = new TinyColor(this.value);
            if (newColor.isValid) {
                setInnerColor(newColor.toHsv());
            }
        }

        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        if (!descriptor?.set || !descriptor.get) {
            return;
        }

        const originalGet = descriptor.get;
        const originalSet = descriptor.set;
        Object.defineProperty(inputEl, "value", {
            configurable: true,

            get() {
                return originalGet.call(this);
            },

            set(value: string) {
                originalSet.call(this, value);
                sync.call(this);
            }
        });

        return () => {
            Object.defineProperty(inputEl, "value", descriptor);
        };
    }, []);

    return (
        <>
            <FormGroup id={id} {...formGroupProps} {...dataProps}>
                <ColorPickerStyledContainer
                    ref={captureNativeRef(HTMLDivElement, wrapperRef)}
                    className="ColorPicker-container"
                    data-focused={isOpen ? "true" : "false"}
                    onClick={() => {
                        if (isOpen) {
                            hide();
                        } else {
                            show();
                        }
                    }}
                >
                    <input
                        {...inputProps}
                        type="text"
                        ref={mergeRefs(innerRef, inputRef)}
                        value={inputValue}
                        onChange={(evt) => {
                            try {
                                const value = evt.currentTarget.value;
                                setInputValue(value);

                                const newColor = new TinyColor(value);
                                if (newColor.isValid) {
                                    setInnerColor(newColor.toHsv());
                                }
                            } finally {
                                if (typeof inputProps.onChange === "function") {
                                    inputProps.onChange(evt);
                                }
                            }
                        }}
                    />
                    <div className="color-preview">
                        <div className="color_picker-preview-checkerboard" />
                        <div
                            className="color_picker-preview-color"
                            style={{ backgroundColor: new TinyColor(innerColor).toRgbString() }}
                        />
                    </div>
                </ColorPickerStyledContainer>
                <Portal
                    containerRef={dropdownRef}
                    initialStyle={{
                        position: "fixed",
                        visibility: "hidden",
                        opacity: "0",
                        transform: "translateX(-50%)"
                    }}
                >
                    <ColorPickerPicker hsv={innerColor} setHsv={setInnerColor} swatches={swatches} />
                </Portal>
            </FormGroup>
        </>
    );
}
