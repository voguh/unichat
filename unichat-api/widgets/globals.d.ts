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
import type { UniChatEvent, UniChatEventUserstoreUpdate } from "./events"

declare global {
    interface UniChatAPI {
        getUserStoreItem(key: string): Promise<string | null>;
    }

    interface UniChatCurrency {
        code: string;
        name: string;
        symbol: string;
    }

    interface UniChatWidgetConnectedEvent {
        userstore: Record<string, string>;
        fieldstate: Record<string, any>;
        currency: UniChatCurrency | null;
    }

    var UniChatAPI: UniChatAPI;

    interface WindowEventMap {
        "unichat:loaded": CustomEvent<UniChatWidgetConnectedEvent>;
        "unichat:connected": CustomEvent<UniChatWidgetConnectedEvent>;
        "unichat:event": CustomEvent<UniChatEvent>;
        "unichat:userstore_update": CustomEvent<UniChatEventUserstoreUpdate["data"]>;
    }
}
