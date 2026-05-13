/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { RefCallback, RefObject } from "preact";

export type Ref<T> = RefObject<T> | RefCallback<T> | null | undefined;

export function mergeRefs<T>(...refs: Ref<T>[]) {
    return (instance: T | null): void => {
        for (const refObject of refs) {
            if (refObject != null) {
                if (refObject instanceof Function) {
                    refObject(instance);
                } else {
                    refObject.current = instance;
                }
            }
        }
    };
}
