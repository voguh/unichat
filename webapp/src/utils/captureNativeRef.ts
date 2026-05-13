/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Component, RefCallback, RefObject } from "preact";

import { Class } from "unichat/types";

import { mergeRefs } from "./mergeRefs";

type Ref<T> = RefObject<T> | RefCallback<T> | null | undefined;

export function captureNativeRef<N extends Element>(ctor: Class<N>, ...cb: Ref<N>[]) {
    if (typeof ctor !== "function") {
        throw new Error("captureNativeRef: ctor must be a class constructor");
    }

    return (instance: Element | Component | null): void => {
        let nativeElement: N | null = null;
        if (instance instanceof Component && instance.base instanceof ctor) {
            nativeElement = instance.base as N;
        } else if (instance instanceof ctor) {
            nativeElement = instance as N;
        }

        mergeRefs(...cb)(nativeElement);
    };
}
