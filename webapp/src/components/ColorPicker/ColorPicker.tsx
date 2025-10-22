/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { ColorPicker as MantineColorPicker, Input, InputProps, Paper } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";

import { ColorPickerStyledContainer } from "./styled";

interface Props extends Omit<InputProps & React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
    label?: string;
    description?: string;
    value?: string;
    onChange?: (value: string) => void;
    swatches?: string[];
    withPickerFree?: boolean;
}

export function ColorPicker(props: Props): React.ReactNode {
    const { label, description, value, onChange, placeholder, swatches, withPickerFree, ...rest } = props;
    const [opened, setOpened] = React.useState(false);

    const ref = useClickOutside<HTMLDivElement>(() => setOpened(false));

    function isPartiallyOrFullyClipped(el: HTMLElement): boolean {
        const rect = el.getBoundingClientRect();
        let parent = el.parentElement;

        while (parent) {
            const style = getComputedStyle(parent);
            if (/(hidden|clip|scroll|auto)/.test(style.overflow + style.overflowY + style.overflowX)) {
                const parentRect = parent.getBoundingClientRect();
                if (
                    rect.top < parentRect.top ||
                    rect.bottom > parentRect.bottom ||
                    rect.left < parentRect.left ||
                    rect.right > parentRect.right
                ) {
                    return true;
                }
            }
            parent = parent.parentElement;
        }

        return false;
    }

    React.useEffect(() => {
        if (opened) {
            if (isPartiallyOrFullyClipped(ref.current)) {
                ref.current.style.bottom = "-4px";
                ref.current.style.transform = "translateY(100%)";
            } else {
                ref.current.removeAttribute("style");
            }
        }
    }, [opened]);

    return (
        <ColorPickerStyledContainer className="colorpicker-group">
            {label && <Input.Label>{label}</Input.Label>}
            {description && <Input.Description>{description}</Input.Description>}
            <div className="colorpicker-inputgroup" onClick={() => setOpened(true)}>
                <Input
                    {...rest}
                    type="text"
                    value={value}
                    onChange={(evt) => onChange?.(evt.currentTarget.value)}
                    placeholder={placeholder}
                />
                <div className="color-preview">
                    <div style={{ backgroundColor: value }} />
                    <span />
                </div>
            </div>
            {opened && (
                <Paper ref={ref} className="colorpicker-picker-wrapper">
                    <MantineColorPicker
                        format="hexa"
                        value={value}
                        onChange={(value) => onChange?.(value)}
                        swatches={swatches ?? []}
                        withPicker={withPickerFree ?? true}
                    />
                </Paper>
            )}
        </ColorPickerStyledContainer>
    );
}
