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

import { FormGroup, FormGroupBaseProps } from "../FormGroup";
import { TextInputStyledContainer } from "./styled";

export interface TextInputProps extends PReact.InputHTMLAttributes<HTMLInputElement>, FormGroupBaseProps {
    inputRef?: PReact.Ref<HTMLInputElement>;
}

export function TextInput(props: TextInputProps): PReact.ComponentChildren {
    const {
        label,
        labelProps,
        description,
        descriptionProps,
        error,
        errorProps,
        id,
        className,
        inputRef,
        ...unfiltered
    } = props;
    const [dataProps, rest] = Object.entries(unfiltered).reduce(
        (acc, [key, value]) => {
            if (key.startsWith("data-")) {
                acc[0][key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)] = value;
            } else {
                acc[1][key] = value;
            }

            return acc;
        },
        [{}, {}] as [Record<string, any>, Record<string, any>]
    );

    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (innerRef.current == null) {
            return;
        }

        function typeNumberSafeguard(this: HTMLInputElement, _event: Event): void {
            if (this.type === "number") {
                this.value = this.value.replace(/[eE+]/g, "");
            }
        }

        innerRef.current.addEventListener("input", typeNumberSafeguard);

        return () => {
            if (innerRef.current == null) {
                return;
            }

            innerRef.current.removeEventListener("input", typeNumberSafeguard);
        };
    }, []);

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
            {...dataProps}
        >
            <TextInputStyledContainer className="TextInput-container">
                <input
                    {...rest}
                    ref={(el) => {
                        if (inputRef != null) {
                            if (inputRef instanceof Function) {
                                inputRef(el);
                            } else {
                                inputRef.current = el;
                            }
                        }

                        innerRef.current = el;
                    }}
                />
            </TextInputStyledContainer>
        </FormGroup>
    );
}
