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

import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormText from "react-bootstrap/FormText";
import ReactSelect, { GroupBase as RSGroupBase, Props as RSProps } from "react-select";
import type ReactSelectSelect from "react-select/dist/declarations/src/Select";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

export type GroupBase<OptionType> = RSGroupBase<OptionType>;
export interface Option {
    label: string;
    value: string;
}

type ReactSelectInternal = ReactSelectSelect<Option, false, GroupBase<Option>>;
type Props = Omit<RSProps<Option, false, GroupBase<Option>>, "isMulti"> & {
    label?: React.ReactNode;
    labelProps?: React.ComponentProps<typeof FormLabel>;
    description?: React.ReactNode;
    descriptionProps?: React.ComponentProps<typeof FormText>;
    error?: React.ReactNode;
    errorProps?: React.ComponentProps<typeof FormText>;
};

const _logger = LoggerFactory.getLogger("Select");
export const Select = React.forwardRef<ReactSelectInternal, Props>(function Select(props, ref) {
    const { label, labelProps, description, descriptionProps, error, errorProps, ...rest } = props;

    return (
        <FormGroup className="form-group">
            {label && <FormLabel {...labelProps}>{label}</FormLabel>}
            {description && (
                <FormText className="form-description" {...descriptionProps}>
                    {description}
                </FormText>
            )}
            <ReactSelect
                {...rest}
                className="react-select__root"
                classNamePrefix="react-select"
                isMulti={false}
                ref={ref}
            />
            {error && (
                <FormText className="form-error" {...errorProps}>
                    {error}
                </FormText>
            )}
        </FormGroup>
    );
});
