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

import { flip, offset, shift } from "@floating-ui/dom";

import { splitProperties } from "unichat/components/forms/__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "unichat/components/forms/FormGroup";
import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";
import { mergeRefs } from "unichat/utils/mergeRefs";

import { isOptionGroup } from "./__utils__/isOptionGroup";
import { DropdownItemRenderer } from "./DropdownItemRenderer";
import { SelectStyledContainer, SelectStyledDropdown } from "./styled";

export interface OptionGroupBase<OptionType> {
    label: string;
    options: OptionType[];
}

export interface Option {
    value: string;
    label: string;
    [key: string]: any;
}

/* ============================================================================================== */

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "ref">;
export interface SelectProps extends VanillaProps, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLInputElement>;
    options: Option[] | OptionGroupBase<Option>[];
}

function adjustFloatingPosition(reference: HTMLElement, floating: HTMLElement, x: number, y: number): [number, number] {
    const wrapperRect = reference.getBoundingClientRect();
    const centeredX = wrapperRect.left + window.scrollX + wrapperRect.width / 2;
    floating.style.width = `${wrapperRect.width}px`;

    return [centeredX, y];
}

export function Select({ options = [], inputRef, id, ...props }: SelectProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, { value, defaultValue, ...inputProps }] = splitProperties(props);
    const isControlled = value !== undefined;

    const [isOpen, setIsOpen] = useState(false);

    const flattenedOptions = useMemo(() => options.flatMap((o) => (isOptionGroup(o) ? o.options : [o])), [options]);
    const [innerValue, setInnerValue] = useState(() => value ?? defaultValue ?? "");
    const currentValue = isControlled ? value : innerValue;
    const selectedOption = flattenedOptions.find((o) => o.value === currentValue) ?? null;

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
            <SelectStyledContainer
                ref={captureNativeRef(HTMLDivElement, wrapperRef)}
                className="Select-container"
                data-focused={isOpen ? "true" : "false"}
                onClick={() => (isOpen ? hide() : show())}
            >
                <input {...inputProps} value={currentValue} ref={mergeRefs(innerRef, inputRef)} readOnly type="text" />
                <div className="fake-input">
                    {selectedOption ? (
                        selectedOption.label
                    ) : (
                        <span className="placeholder">{inputProps.placeholder || "Select an option"}</span>
                    )}
                </div>
                <div className="dropdown-indicator">
                    <i className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} />
                </div>
            </SelectStyledContainer>
            <Portal
                containerRef={dropdownRef}
                initialStyle={{ position: "fixed", visibility: "hidden", opacity: "0", transform: "translateX(-50%)" }}
            >
                <SelectStyledDropdown>
                    {options.map((item, idx) => (
                        <DropdownItemRenderer
                            key={idx}
                            item={item}
                            selectedOption={selectedOption}
                            onClick={(option) => {
                                try {
                                    if (!isControlled) {
                                        setInnerValue(option.value);
                                    }

                                    const inputEl = innerRef.current;
                                    if (inputEl != null) {
                                        inputEl.value = option.value;
                                        inputEl.dispatchEvent(new Event("change", { bubbles: true }));
                                    }
                                } finally {
                                    hide();
                                }
                            }}
                        />
                    ))}
                </SelectStyledDropdown>
            </Portal>
        </FormGroup>
    );
}
