/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { FormGroupBaseProps } from "../FormGroup";

const forGroupPropsArray = [
    "className",

    "label",
    "labelProps",
    "description",
    "descriptionProps",
    "error",
    "errorProps"
];
export function splitProperties<T extends Record<string, any>>(
    properties: T
): [FormGroupBaseProps, Record<string, string>, T] {
    const formGroupProps: Record<string, unknown> = {};
    const dataProps: Record<string, string> = {};
    const rest: T = {} as T;

    for (const [key, value] of Object.entries(properties)) {
        if (key.startsWith("data-")) {
            dataProps[key] = value;
        } else if (forGroupPropsArray.includes(key)) {
            formGroupProps[key] = value;
        } else {
            rest[key as keyof T] = value;
        }
    }

    return [formGroupProps as FormGroupBaseProps, dataProps, rest];
}
