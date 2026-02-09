/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { NumberFormatOptions, useNumberFormat } from "@react-input/number-format";
import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import FormControl, { FormControlProps } from "react-bootstrap/FormControl";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { FormGroup, FormGroupBaseProps } from "./FormGroup";

// eslint-disable-next-line prettier/prettier
export interface NumberInputProps extends ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps>, FormGroupBaseProps, NumberFormatOptions {
    locales?: Intl.LocalesArgument;
}

function isNumberFormatProp(key: string): boolean {
    return [
        "currency",
        "currencyDisplay",
        "unit",
        "unitDisplay",
        "signDisplay",
        "minimumIntegerDigits",
        "minimumFractionDigits",
        "maximumFractionDigits",
        "format",
        "groupDisplay",
        "maximumIntegerDigits",
        "locales"
    ].includes(key);
}

const _logger = LoggerFactory.getLogger("NumberInput");
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, id, className, ...unfiltered } = props;
    const [dataProps, numberFormat, rest] = Object.entries(unfiltered).reduce(
        (acc, [key, value]) => {
            if (key.startsWith("data-")) {
                acc[0][key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] = value;
            } else if (isNumberFormatProp(key)) {
                acc[2][key] = value;
            } else {
                acc[2][key] = value;
            }

            return acc;
        },
        [{}, {}, {}] as unknown as [Record<string, any>, Record<string, any>, Record<string, any>]
    );

    const inputRef = useNumberFormat(numberFormat);

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
            <FormControl
                {...rest}
                ref={(node) => {
                    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;

                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
            />
        </FormGroup>
    );
});
