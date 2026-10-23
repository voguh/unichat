/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { createContext } from "preact";
import type { Dispatch, StateUpdater } from "preact/hooks";

export interface ModalContextType<T extends object = Record<string, any>> {
    onClose: () => void;
    setSharedStore: Dispatch<StateUpdater<Partial<T>>>;
    sharedStore: Partial<T>;
}

export const ModalContext = createContext({} as ModalContextType<any>);
