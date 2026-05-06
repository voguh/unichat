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
import { useEffect, useState } from "preact/hooks";

import { flip, offset, shift } from "@floating-ui/dom";

import { Portal } from "unichat/components/Portal";
import { useComputePosition } from "unichat/hooks/useComputePosition";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { FormGroup, FormGroupBaseProps } from "../FormGroup";
import { SelectStyledContainer, SelectStyledDropdown, SelectStyledGroupContainer, SelectStyledOption } from "./styled";

export interface OptionGroupBase<OptionType> {
    label: string;
    options: OptionType[];
}

export interface Option {
    value: string;
    label: string;
    [key: string]: any;
}

function isOptionGroup(option: Option | OptionGroupBase<Option>): option is OptionGroupBase<Option> {
    return "options" in option && "label" in option;
}

function isOption(option: Option | OptionGroupBase<Option>): option is Option {
    return "value" in option && "label" in option;
}

/* ============================================================================================== */

interface OptionProps {
    option: Option;
    selected?: boolean;
    onClick: (value: Option) => void;
}

function OptionRenderer({ onClick, option, selected }: OptionProps): PReact.ComponentChildren {
    return (
        <SelectStyledOption data-selected={selected ? "true" : "false"} onClick={() => onClick(option)}>
            {option.label}
        </SelectStyledOption>
    );
}

/* ============================================================================================== */

interface GroupOptionProps {
    group: OptionGroupBase<Option>;
    selectedValue: Option | null;
    onClick: (value: Option) => void;
}

function GroupOptionRenderer({ group, onClick, selectedValue }: GroupOptionProps): PReact.ComponentChildren {
    return (
        <SelectStyledGroupContainer>
            <div className="group-label">{group.label}</div>
            <div className="group-items">
                {group.options.map((option, idx) => (
                    <OptionRenderer
                        key={idx}
                        onClick={onClick}
                        option={option}
                        selected={option.value === selectedValue?.value}
                    />
                ))}
            </div>
        </SelectStyledGroupContainer>
    );
}

/* ============================================================================================== */

interface DropdownItemProps {
    item: Option | OptionGroupBase<Option>;
    selectedValue: Option | null;
    onClick: (value: Option) => void;
}

function DropdownItemRenderer({ item, onClick, selectedValue }: DropdownItemProps): PReact.ComponentChildren {
    if (isOptionGroup(item)) {
        return <GroupOptionRenderer group={item} onClick={onClick} selectedValue={selectedValue} />;
    } else {
        return <OptionRenderer onClick={onClick} option={item} selected={item.value === selectedValue?.value} />;
    }
}

/* ============================================================================================== */

export type SelectProps = Omit<PReact.HTMLAttributes<HTMLDivElement>, "onChange"> &
    FormGroupBaseProps & {
        options: Option[] | OptionGroupBase<Option>[];
        value?: Option | null;
        onChange?: (value: Option | null) => void;
    };

function adjustFloatingPosition(reference: HTMLElement, floating: HTMLElement, x: number, y: number): [number, number] {
    const wrapperRect = reference.getBoundingClientRect();
    const centeredX = wrapperRect.left + window.scrollX + wrapperRect.width / 2;
    floating.style.width = `${wrapperRect.width}px`;

    return [centeredX, y];
}

export function Select({ options = [], onChange, value, ...props }: SelectProps): PReact.ComponentChildren {
    const { label, labelProps, description, descriptionProps, error, errorProps, id, className, ...unfiltered } = props;
    const [dataProps, rest] = Object.entries(unfiltered).reduce(
        (acc, [key, value]) => {
            if (key.startsWith("data-")) {
                acc[0][key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] = value;
            } else {
                acc[1][key] = value;
            }

            return acc;
        },
        [{}, {}] as unknown as [Record<string, any>, Record<string, any>]
    );

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<Option | null>(value ?? null);

    const [wrapperRef, dropdownRef, updateVisualization] = useComputePosition<HTMLDivElement, HTMLDivElement>(
        { placement: "bottom", middleware: [offset(8), flip(), shift({ padding: 8 })] },
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
        if (value != null) {
            setInternalValue(value);
        }
    }, [value]);

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
        if (options.length > 0) {
            const isOptionGroupAll = options.every(isOptionGroup);
            const isOptionAll = options.every(isOption);

            if (!isOptionGroupAll && !isOptionAll) {
                throw new Error("All options must be either Option or OptionGroup");
            }
        }
    }, [options]);

    return (
        <FormGroup
            id={id}
            className={className}
            label={label}
            labelProps={labelProps}
            description={description}
            descriptionProps={descriptionProps}
            error={error}
            errorProps={errorProps}
            {...dataProps}
        >
            <SelectStyledContainer
                {...rest}
                ref={captureNativeRef(HTMLDivElement, wrapperRef)}
                className="Select-container"
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
                    readOnly
                    type="text"
                    value={internalValue?.label ?? ""}
                    placeholder="Select an option"
                    onKeyDown={(event) => {
                        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            show();
                        }

                        if (event.key === "Escape") {
                            hide();
                        }
                    }}
                />

                <div className="dropdown-indicator">
                    {isOpen ? <i className="fas fa-chevron-up" /> : <i className="fas fa-chevron-down" />}
                </div>
            </SelectStyledContainer>
            <Portal
                containerRef={dropdownRef}
                initialStyle={{
                    position: "fixed",
                    visibility: "hidden",
                    opacity: "0",
                    transform: "translateX(-50%)"
                }}
            >
                <SelectStyledDropdown>
                    {options.map((item, idx) => (
                        <DropdownItemRenderer
                            key={idx}
                            item={item}
                            selectedValue={internalValue}
                            onClick={(option) => {
                                try {
                                    if (value == null) {
                                        setInternalValue(option);
                                    }

                                    onChange?.(option);
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
