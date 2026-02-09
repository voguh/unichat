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

import FormControl from "react-bootstrap/FormControl";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormText from "react-bootstrap/FormText";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

interface Props extends React.ComponentProps<typeof FormControl> {
    label?: React.ReactNode;
    labelProps?: React.ComponentProps<typeof FormLabel>;
    description?: React.ReactNode;
    descriptionProps?: React.ComponentProps<typeof FormText>;
    error?: React.ReactNode;
    errorProps?: React.ComponentProps<typeof FormText>;
}

const _logger = LoggerFactory.getLogger("TextInput");
export const TextInput = React.forwardRef<HTMLInputElement, Props>(function TextInput(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, ...rest } = props;

    return (
        <FormGroup className="form-group">
            {label && <FormLabel {...labelProps}>{label}</FormLabel>}
            {description && (
                <FormText className="form-description" {...descriptionProps}>
                    {description}
                </FormText>
            )}
            <FormControl {...rest} ref={ref} />
            {error && (
                <FormText className="form-error" {...errorProps}>
                    {error}
                </FormText>
            )}
        </FormGroup>
    );
});
