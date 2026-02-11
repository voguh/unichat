/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import SketchPicker from "@uiw/react-color-sketch";
import FormControl from "react-bootstrap/FormControl";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { Popover } from "../OverlayTrigger";
import { FormGroup } from "./FormGroup";
import { TextInputProps } from "./TextInput";

interface ColorPickerProps extends Omit<TextInputProps, "onChange"> {
    onChange?: (value: string) => void;
    swatches?: string[];
}

function isColorPickerProps(key: string): boolean {
    return ["swatches"].includes(key);
}

const _logger = LoggerFactory.getLogger("ColorPicker");
export const ColorPicker = React.forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(props, inputRef) {
    const { label, labelProps, description, descriptionProps, error, errorProps, id, className, ...unfiltered } = props;
    const [dataProps, colorPickerProps, restProps] = Object.entries(unfiltered).reduce(
        (acc, [key, value]) => {
            if (key.startsWith("data-")) {
                acc[0][key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] = value;
            } else if (isColorPickerProps(key)) {
                acc[2][key] = value;
            } else {
                acc[2][key] = value;
            }

            return acc;
        },
        [{}, {}, {}] as unknown as [Record<string, any>, Record<string, any>, Record<string, any>]
    );

    const picker = (
        <SketchPicker
            style={{ margin: -14 }}
            presetColors={colorPickerProps.swatches}
            color={restProps.value || restProps.defaultValue}
            onChange={(color) => restProps.onChange?.(color.hex)}
        />
    );

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
            <Popover trigger="focus" placement="bottom" flip content={picker}>
                <div className="colorpicker-inputgroup">
                    <FormControl
                        {...restProps}
                        onChange={(evt) => restProps.onChange?.(evt.currentTarget.value)}
                        ref={inputRef}
                    />
                    <div className="color-preview">
                        <div style={{ backgroundColor: restProps.value || restProps.defaultValue }} />
                        <span />
                    </div>
                </div>
            </Popover>
        </FormGroup>
    );
});
