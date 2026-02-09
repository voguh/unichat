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

import ReactSelect, { GroupBase as RSGroupBase, Props as RSProps } from "react-select";
import type ReactSelectSelect from "react-select/dist/declarations/src/Select";

import { LoggerFactory } from "unichat/logging/LoggerFactory";

import { FormGroup, FormGroupBaseProps } from "./FormGroup";

export type GroupBase<OptionType> = RSGroupBase<OptionType>;
export interface Option {
    label: string;
    value: string;
}

type ReactSelectInternal = ReactSelectSelect<Option, false, GroupBase<Option>>;
type Props = Omit<RSProps<Option, false, GroupBase<Option>>, "isMulti"> & FormGroupBaseProps;

const _logger = LoggerFactory.getLogger("Select");
export const Select = React.forwardRef<ReactSelectInternal, Props>(function Select(props, ref) {
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
            <ReactSelect
                {...rest}
                className="react-select__root"
                classNamePrefix="react-select"
                isMulti={false}
                ref={ref}
            />
        </FormGroup>
    );
});
