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
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import { TinyColor } from "@ctrl/tinycolor";
import { flip, offset, shift } from "@floating-ui/dom";

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
    const [formGroupProps, dataProps, { value, defaultValue, ...inputProps }] = splitProperties(props);
    const isControlled = value !== undefined;

    const [isOpen, setIsOpen] = useState(false);

    const [innerValue, setInnerValue] = useState(value ?? defaultValue ?? "");
    const currentValue = isControlled ? value : innerValue;
    const currentTinyColor = useMemo(() => new TinyColor(currentValue), [currentValue]);
    const currentRgbString = useMemo(() => currentTinyColor.toRgbString(), [currentTinyColor]);

    const innerRef = useRef<HTMLInputElement>(null);
    const [wrapperRef, dropdownRef, updateVisualization] = useComputePosition<HTMLDivElement, HTMLDivElement>(
        { placement: "bottom", middleware: [offset(2), flip(), shift({ padding: 8 })] },
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

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <FormGroup id={id} {...formGroupProps} {...dataProps}>
            <ColorPickerStyledContainer
                ref={captureNativeRef(HTMLDivElement, wrapperRef)}
                className="ColorPicker-container"
                data-focused={isOpen ? "true" : "false"}
                onClick={() => (isOpen ? hide() : show())}
            >
                <input
                    {...inputProps}
                    value={currentValue}
                    ref={mergeRefs(innerRef, inputRef)}
                    type="text"
                    onChange={(evt) => {
                        try {
                            if (!isControlled) {
                                setInnerValue(evt.currentTarget.value);
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
                    <div className="color_picker-preview-color" style={{ backgroundColor: currentRgbString }} />
                </div>
            </ColorPickerStyledContainer>
            <Portal
                containerRef={dropdownRef}
                initialStyle={{ position: "fixed", visibility: "hidden", opacity: "0", transform: "translateX(-50%)" }}
            >
                <ColorPickerPicker
                    currentColor={currentTinyColor}
                    onChange={(newColor) => {
                        const color = new TinyColor(newColor).toRgbString();

                        if (!isControlled) {
                            setInnerValue(color);
                        }

                        const inputEl = innerRef.current;
                        if (inputEl != null) {
                            inputEl.value = color;
                            inputEl.dispatchEvent(new Event("change", { bubbles: true }));
                        }
                    }}
                    swatches={swatches}
                />
            </Portal>
        </FormGroup>
    );
}
