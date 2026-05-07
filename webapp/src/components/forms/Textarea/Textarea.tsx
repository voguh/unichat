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

import { splitProperties } from "unichat/components/forms/__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "unichat/components/forms/FormGroup";
import { captureNativeRef } from "unichat/utils/captureNativeRef";

import { StyledTextarea } from "./styled";

type VanillaProps = PReact.TextareaHTMLAttributes<HTMLTextAreaElement>;
export interface TextareaProps extends VanillaProps, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLTextAreaElement>;
}

export function Textarea({ inputRef, id, ...props }: TextareaProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, rest] = splitProperties(props);

    return (
        <FormGroup id={id} {...formGroupProps} {...dataProps}>
            <StyledTextarea {...rest} ref={captureNativeRef(HTMLTextAreaElement, inputRef)} />
        </FormGroup>
    );
}
