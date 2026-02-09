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

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { FormGroup, FormGroupBaseProps } from "./FormGroup";

type Props = ReplaceProps<"input", BsPrefixProps<"input"> & FormCheckProps> & FormGroupBaseProps;

const _logger = LoggerFactory.getLogger("Switch");
export const Switch = React.forwardRef<HTMLInputElement, Props>(function Switch(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, id, className, ...rest } = props;

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
        >
            <FormCheck {...rest} type="switch" ref={ref} />
        </FormGroup>
    );
});
