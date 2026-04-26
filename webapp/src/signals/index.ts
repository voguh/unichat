/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { Dispatch, StateUpdater } from "preact/hooks";

import { signal } from "@preact/signals";

const signals = {
    requiresRestart: signal(false),
    showWidgetPreview: signal(true)
};

type SignalValue<K extends keyof typeof signals> = (typeof signals)[K]["value"];
type SignalStateUpdater<K extends keyof typeof signals> = StateUpdater<SignalValue<K>>;
type SignalDispatch<K extends keyof typeof signals> = Dispatch<SignalStateUpdater<K>>;

export function useGlobalSignal<K extends keyof typeof signals>(signal: K): [SignalValue<K>, SignalDispatch<K>] {
    if (!(signal in signals)) {
        throw new Error(`Signal "${signal}" does not exist`);
    }

    function setter(value: SignalStateUpdater<K>): void {
        if (value instanceof Function) {
            signals[signal].value = value(signals[signal].value);
        } else {
            signals[signal].value = value;
        }
    }

    return [signals[signal].value, setter];
}
