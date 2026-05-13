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

import { splitProperties } from "./__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "./FormGroup";

type VanillaProps = PReact.TextareaHTMLAttributes<HTMLTextAreaElement>;
export interface TextareaProps extends VanillaProps, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLTextAreaElement>;
}

export function Textarea({ inputRef, id, ...props }: TextareaProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, textareaProps] = splitProperties(props);

    return (
        <FormGroup id={id} {...formGroupProps} {...dataProps}>
            <div className="Textarea-container">
                <textarea {...textareaProps} ref={inputRef} />
            </div>
        </FormGroup>
    );
}
