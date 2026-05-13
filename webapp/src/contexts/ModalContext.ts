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
import { Dispatch, StateUpdater } from "preact/hooks";

export interface ModalContextType {
    onClose: () => void;
    setSharedStore: Dispatch<StateUpdater<Record<string, any>>>;
    sharedStore: Record<string, any>;
}

export const ModalContext = createContext({} as ModalContextType);
