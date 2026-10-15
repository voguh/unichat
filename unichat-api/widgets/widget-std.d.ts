/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/// <reference types="jquery" />
import type { UniChatEvent } from "./events"

declare global {
    var UniChatAPI: {
        getUserStoreItem: (key: string) => Promise<string | null>;
    }

    interface WindowEventMap {
        "unichat:connected": CustomEvent<{ userstore: Record<string, string> }>;
        "unichat:event": CustomEvent<UniChatEvent>;
    }
}
