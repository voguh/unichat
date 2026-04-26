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

import { computePosition, flip, offset, shift } from "@floating-ui/dom";

import { useClickOutside } from "unichat/hooks/useClickOutside";

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

interface Props {
    options: Option[] | OptionGroupBase<Option>[];
    value?: Option;
    onChange?: (value: Option) => void;
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

export function Select({ options = [], onChange, value }: Props): PReact.ComponentChildren {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<Option | null>(value ?? null);

    const wrapperRef = useClickOutside(hide);
    const dropdownRef = useRef<HTMLDivElement>(null);

    async function updatePosition(visible: boolean): Promise<void> {
        if (!wrapperRef.current || !dropdownRef.current) {
            return;
        }

        if (!visible) {
            Object.assign(dropdownRef.current.style, {
                visibility: "hidden",
                opacity: "0",
                left: "0",
                top: "0"
            });
            return;
        }

        const { x, y } = await computePosition(wrapperRef.current, dropdownRef.current, {
            placement: "bottom",
            middleware: [offset(8), flip(), shift({ padding: 8 })]
        });

        Object.assign(dropdownRef.current.style, {
            visibility: "visible",
            opacity: "1",
            left: `${x}px`,
            top: `${y}px`
        });
    }

    function show(): void {
        setIsOpen(true);
        updatePosition(true);
    }

    function hide(): void {
        setIsOpen(false);
        updatePosition(false);
    }

    function captureRef(el: Element | PReact.Component | null): void {
        if (el instanceof Element) {
            wrapperRef.current = el;
        } else if (el != null) {
            if ("base" in el && el.base instanceof Element) {
                wrapperRef.current = el.base;
            } else {
                throw new Error("Select trigger must be an Element or a Component that forwards ref to an Element");
            }
        }
    }

    useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value);
        }
    }, [value]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleReposition(): void {
            updatePosition(true);
        }

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === "Escape") {
                hide();
            }
        }

        window.addEventListener("resize", handleReposition);
        window.addEventListener("scroll", handleReposition, true);
        window.addEventListener("keydown", handleKeyDown);

        updatePosition(true);

        return () => {
            window.removeEventListener("resize", handleReposition);
            window.removeEventListener("scroll", handleReposition, true);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, options]);

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
        <SelectStyledContainer ref={captureRef} className="select-container">
            <input
                readOnly
                type="text"
                value={internalValue?.label ?? ""}
                placeholder="Select an option"
                onClick={() => {
                    if (isOpen) {
                        hide();
                    } else {
                        show();
                    }
                }}
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
            <div
                ref={dropdownRef}
                style={{
                    position: "absolute",
                    visibility: isOpen ? "visible" : "hidden",
                    opacity: isOpen ? "1" : "0",
                    width: "100%",
                    pointerEvents: isOpen ? "auto" : "none"
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
            </div>
        </SelectStyledContainer>
    );
}
