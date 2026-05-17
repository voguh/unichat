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

import { clsx } from "unichat/utils/clsx";

import { FormGroupStyledContainer } from "./styled";

export interface FormGroupBaseProps {
    label?: PReact.ComponentChild;
    labelProps?: PReact.LabelHTMLAttributes<HTMLLabelElement>;
    description?: PReact.ComponentChild;
    descriptionProps?: PReact.HTMLAttributes<HTMLElement>;
    error?: PReact.ComponentChild;
    errorProps?: PReact.HTMLAttributes<HTMLElement>;
}

export interface FormGroupProps extends PReact.HTMLAttributes<HTMLDivElement>, FormGroupBaseProps {}

export function FormGroup(props: FormGroupProps): PReact.ComponentChildren {
    const { label, labelProps, description, descriptionProps, error, errorProps, children, ...rest } = props;

    return (
        <FormGroupStyledContainer {...rest} className={clsx("form-group", rest.className)}>
            {label && (
                <label {...labelProps} className={clsx("form-label", labelProps?.className)}>
                    {label}
                </label>
            )}
            {description && (
                <small {...descriptionProps} className={clsx("form-description", descriptionProps?.className)}>
                    {description}
                </small>
            )}
            {children}
            {error && (
                <small {...errorProps} className={clsx("form-error", errorProps?.className)}>
                    {error}
                </small>
            )}
        </FormGroupStyledContainer>
    );
}
