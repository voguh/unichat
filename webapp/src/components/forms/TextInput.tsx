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

import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import FormControl, { FormControlProps } from "react-bootstrap/FormControl";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { FormGroup, FormGroupBaseProps } from "./FormGroup";

export type TextInputProps = ReplaceProps<"input", BsPrefixProps<"input"> & FormControlProps> & FormGroupBaseProps;

const _logger = LoggerFactory.getLogger("TextInput");
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(props, ref) {
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
            <FormControl {...rest} ref={ref} />
        </FormGroup>
    );
});
