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
import { useEffect, useRef } from "preact/hooks";

import { mergeRefs } from "unichat/utils/mergeRefs";

import { splitProperties } from "./__utils__/splitProperties";
import { FormGroup, FormGroupBaseProps } from "./FormGroup";

type VanillaProps = Omit<PReact.InputHTMLAttributes<HTMLInputElement>, "type">;
export interface NumberInputProps extends VanillaProps, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function NumberInput({ inputRef, id, ...props }: NumberInputProps): PReact.ComponentChildren {
    const [formGroupProps, dataProps, inputProps] = splitProperties(props);

    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const input = innerRef.current;
        if (input == null) {
            return;
        }

        function typeNumberSafeguard(this: HTMLInputElement, _event: Event): void {
            this.value = this.value.replace(/[eE+]/g, "");
        }

        input.addEventListener("input", typeNumberSafeguard);

        return () => {
            input.removeEventListener("input", typeNumberSafeguard);
        };
    }, []);

    return (
        <FormGroup id={id} {...formGroupProps} {...dataProps}>
            <div className="NumberInput-container">
                <input {...inputProps} type="text" ref={mergeRefs(inputRef, innerRef)} />
            </div>
        </FormGroup>
    );
}
