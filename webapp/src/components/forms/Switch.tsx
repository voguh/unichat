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
import FormCheck, { FormCheckProps } from "react-bootstrap/FormCheck";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormText from "react-bootstrap/FormText";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

interface Props extends ReplaceProps<"input", BsPrefixProps<"input"> & FormCheckProps> {
    label?: React.ReactNode;
    labelProps?: React.ComponentProps<typeof FormLabel>;
    description?: React.ReactNode;
    descriptionProps?: React.ComponentProps<typeof FormText>;
    error?: React.ReactNode;
    errorProps?: React.ComponentProps<typeof FormText>;
}

const _logger = LoggerFactory.getLogger("Switch");
export const Switch = React.forwardRef<HTMLInputElement, Props>(function Switch(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, ...rest } = props;

    return (
        <FormGroup className="form-group">
            {label && <FormLabel {...labelProps}>{label}</FormLabel>}
            {description && (
                <FormText className="form-description" {...descriptionProps}>
                    {description}
                </FormText>
            )}
            <FormCheck {...rest} type="switch" ref={ref} />
            {error && (
                <FormText className="form-error" {...errorProps}>
                    {error}
                </FormText>
            )}
        </FormGroup>
    );
});
