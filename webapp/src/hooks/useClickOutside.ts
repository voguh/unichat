/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

import { clickOutside } from "unichat/utils/clickOutside";

export function useClickOutside<T extends Element = Element>(cb: (event?: Event) => void): RefObject<T> {
    const ref = useRef<T | null>(null);

    useEffect(() => clickOutside(cb, ref), [cb]);

    return ref;
}
