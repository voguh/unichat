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

import clsx from "clsx";
import type { BsPrefixProps, ReplaceProps } from "react-bootstrap/esm/helpers";
import BSFormGroup, { FormGroupProps } from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormText from "react-bootstrap/FormText";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

export interface FormGroupBaseProps {
    label?: React.ReactNode;
    labelProps?: React.ComponentProps<typeof FormLabel>;
    description?: React.ReactNode;
    descriptionProps?: React.ComponentProps<typeof FormText>;
    error?: React.ReactNode;
    errorProps?: React.ComponentProps<typeof FormText>;
}

type Props = React.PropsWithChildren<ReplaceProps<"div", BsPrefixProps<"div"> & FormGroupProps>> & FormGroupBaseProps;

const _logger = LoggerFactory.getLogger("FormGroup");
export const FormGroup = React.forwardRef<HTMLDivElement, Props>(function FormGroup(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, children, ...rest } = props;

    return (
        <BSFormGroup {...rest} ref={ref} className={clsx("form-group", rest.className)}>
            {label && <FormLabel {...labelProps}>{label}</FormLabel>}
            {description && (
                <FormText className="form-description" {...descriptionProps}>
                    {description}
                </FormText>
            )}
            {children}
            {error && (
                <FormText className="form-error" {...errorProps}>
                    {error}
                </FormText>
            )}
        </BSFormGroup>
    );
});
