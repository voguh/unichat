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
import { useEffect, useRef, useState } from "preact/hooks";

import { splitProperties } from "unichat/components/forms/__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "unichat/components/forms/FormGroup";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { StyledInputWrapper } from "./styled";

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "type">;
export interface SwitchProps extends VanillaProps, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function Switch({ inputRef, id, ...props }: SwitchProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, inputProps] = splitProperties(props);

    return (
        <FormGroup id={id} {...formGroupProps} {...dataProps}>
            <StyledInputWrapper>
                <input {...inputProps} type="checkbox" ref={captureNativeRef(HTMLInputElement, inputRef)} />
                <div />
            </StyledInputWrapper>
        </FormGroup>
    );
}
