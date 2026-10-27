/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

declare global {
    interface UniChatLogger {
        trace(message: string, ...args: unknown[]): void;
        debug(message: string, ...args: unknown[]): void;
        info(message: string, ...args: unknown[]): void;
        warn(message: string, ...args: unknown[]): void;
        error(message: string | Error, ...args: unknown[]): void;
    }

    interface UniChatScraperEventPayload {
        type: string;
        [key: string]: unknown;
    }

    interface UniChatWebSocketContext {
        wsInstance: WebSocket;
        url: string | URL;
        protocols?: string | string[];
    }

    interface UniChat {
        readonly scraperId: string;
        dispatchEvent(payload: UniChatScraperEventPayload): Promise<void>;

        onWebSocketMessage?: (event: MessageEvent, context: UniChatWebSocketContext) => void | Promise<void>;
        preWebSocketSend?: (data: any, context: UniChatWebSocketContext) => any;
        onWebSocketSend?: (data: any, context: UniChatWebSocketContext) => void | Promise<void>;

        preFetch?: (args: Parameters<typeof fetch>) => Parameters<typeof fetch> | void | Promise<Parameters<typeof fetch> | void>;
        onFetchRequest?: (args: Parameters<typeof fetch>) => void | Promise<void>;
        onFetchResponse?: (res: Response, args: Parameters<typeof fetch>) => void | Promise<void>;
    }

    var uniChatLogger: UniChatLogger;
    var uniChat: UniChat;
}

export {};
