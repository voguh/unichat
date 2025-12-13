/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

class UniChatLogger {
    constructor() {
        const scrapperWebviewWindow = __TAURI__.webviewWindow.getCurrentWebviewWindow();
        const label = scrapperWebviewWindow.label;
        const scrapperName = label.replace("-chat", "");
        this.scrapperName = scrapperName;
    }

    trace(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        __TAURI_PLUGIN_LOG__.trace(formatted).catch(console.error);
        console.trace(formatted);

        if (throwable) {
            __TAURI_PLUGIN_LOG__.error(throwable.stack).catch(console.error);
            console.error(throwable);
            uniChat.dispatchEvent({ type: "error", message: throwable.message, stack: throwable.stack });
        }
    }

    debug(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        __TAURI_PLUGIN_LOG__.debug(formatted).catch(console.error);
        console.debug(formatted);

        if (throwable) {
            __TAURI_PLUGIN_LOG__.error(throwable.stack).catch(console.error);
            console.error(throwable);
            uniChat.dispatchEvent({ type: "error", message: throwable.message, stack: throwable.stack });
        }
    }

    info(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        __TAURI_PLUGIN_LOG__.info(formatted).catch(console.error);
        console.info(formatted);

        if (throwable) {
            __TAURI_PLUGIN_LOG__.error(throwable.stack).catch(console.error);
            console.error(throwable);
            uniChat.dispatchEvent({ type: "error", message: throwable.message, stack: throwable.stack });
        }
    }

    warn(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        __TAURI_PLUGIN_LOG__.warn(formatted).catch(console.error);
        console.warn(formatted);

        if (throwable) {
            __TAURI_PLUGIN_LOG__.error(throwable.stack).catch(console.error);
            console.error(throwable);
            uniChat.dispatchEvent({ type: "error", message: throwable.message, stack: throwable.stack });
        }
    }

    error(message, ...args) {
        if (message instanceof Error && args.length === 0) {
            args.push(message);
            message = message.message;
        }

        const { formatted, throwable } = this.#format(message, args);
        __TAURI_PLUGIN_LOG__.error(formatted).catch(console.error);
        console.error(formatted);

        if (throwable) {
            __TAURI_PLUGIN_LOG__.error(throwable.stack).catch(console.error);
            console.error(throwable);
            uniChat.dispatchEvent({ type: "error", message: throwable.message, stack: throwable.stack });
        }
    }

    #format(message, args) {
        let throwable = null;
        let usedArgs = args;

        if (args.length > 0 && args[args.length - 1] instanceof Error) {
            throwable = args[args.length - 1];
            usedArgs = args.slice(0, -1);
        }

        let formatted = message;
        for (const arg of usedArgs) {
            formatted = formatted.replace("{}", String(arg));
        }

        formatted = `[UniChat Scrapper - ${this.scrapperName}] ${formatted}`;

        return { formatted, throwable };
    }
}

/** @type {UniChatLogger} */
globalThis.uniChatLogger = globalThis.uniChatLogger || new UniChatLogger();

/* ================================================================================================================== */

if (globalThis.uniChat == null || typeof globalThis.uniChat !== "object") {
    /**
     * @typedef {Object} UniChat
     * @property {function(UniChatEventPayload): Promise<void>} dispatchEvent - Function to dispatch events to the main application.
     */
    /** @type {UniChat} */
    globalThis.uniChat = globalThis.uniChat || {};
}

if (uniChat.dispatchEvent == null || typeof uniChat.dispatchEvent !== "function") {
    uniChat.dispatchEvent = async function (payload) {
        if (payload == null || typeof payload !== "object") {
            throw new Error("Payload must be a non-null object.");
        }

        if (payload.type == null || typeof payload.type !== "string" || payload.type.trim() === "") {
            throw new Error("Payload must have a non-empty string 'type' property.");
        }

        uniChatLogger.debug("Dispatching event of type '{}'", payload.type);
        const scrapperWebviewWindow = __TAURI__.webviewWindow.getCurrentWebviewWindow();
        const label = scrapperWebviewWindow.label;
        const scrapperName = label.replace("-chat", "");

        payload.timestamp = Date.now();
        await __TAURI__.event.emit(`${scrapperName}_raw::event`, payload)
            .then(() => uniChatLogger.debug("Event of type '{}' dispatched successfully", payload.type))
            .catch((err) => uniChatLogger.error(err.message, err));
    }
}

/* ================================================================================================================== */

async function uniChatDispatchIdle() {
    await uniChat.dispatchEvent({ type: "idle" });
    setTimeout(uniChatDispatchIdle, 5000);
}

async function uniChatDispatchPing() {
    await uniChat.dispatchEvent({ type: "ping" });
    setTimeout(uniChatDispatchPing, 5000);
}

/* ================================================================================================================== */

if (window.WebSocket.__WRAPPED__ !== true) {
    uniChatLogger.info("Wrapping WebSocket to monitor messages.");
    const OriginalWebSocket = window.WebSocket;

    window.WebSocket = function (url, protocols) {
        const wsInstance = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

        wsInstance.addEventListener("message", async (event) => {
            try {
                if (typeof uniChat.onWebSocketMessage === "function") {
                    await uniChat.onWebSocketMessage(event, { wsInstance, url, protocols });
                }
            } catch (err) {
                uniChatLogger.error(err.message, err);
            }
        });

        return wsInstance;
    };

    window.WebSocket.prototype = OriginalWebSocket.prototype;
    Object.defineProperty(window.WebSocket, "CONNECTING", { value: OriginalWebSocket.CONNECTING });
    Object.defineProperty(window.WebSocket, "OPEN", { value: OriginalWebSocket.OPEN });
    Object.defineProperty(window.WebSocket, "CLOSING", { value: OriginalWebSocket.CLOSING });
    Object.defineProperty(window.WebSocket, "CLOSED", { value: OriginalWebSocket.CLOSED });
    Object.defineProperty(window.WebSocket, "__WRAPPED__", { value: true, writable: false });
}

if (window.fetch.__WRAPPED__ !== true) {
    uniChatLogger.info("Wrapping fetch function to monitor network requests.");
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const res = await originalFetch.apply(this, args);

        if (typeof uniChat.onFetchResponse === "function") {
            uniChat.onFetchResponse(res.clone(), ...args);
        }

        return res;
    }

    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, writable: false });
}

/* ================================================================================================================== */

{{SCRAPPER_JS}}

/* ================================================================================================================== */

function uniChatPreInit() {
    try {
        if ( window.location.href.startsWith("tauri://") || window.location.href.startsWith("http://localhost")) {
            uniChatLogger.info("Scrapper is not running, setting up idle dispatch.");
            uniChatDispatchIdle();
            return;
        }

        uniChatLogger.info("UniChat scrapper initializing...")
        const style = document.createElement("style");
        style.textContent = `
            html::before {
                content: "UniChat installed! You can close this window.";
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                white-space: nowrap;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        __TAURI__.core.invoke("is_dev").then((isDev) => {
            if (!isDev) {
                window.addEventListener("contextmenu", async (event) => {
                    event.preventDefault();
                });
            }
        });

        if (typeof uniChatInit !== "function") {
            throw new Error("UniChat scrapper initialization function not found.");
        }

        uniChatLogger.info("Calling uniChatInit...");
        const payload = uniChatInit();

        uniChat.dispatchEvent({ type: "ready", url: window.location.href, ...payload });
        uniChatLogger.info("UniChat scrapper initialized.");
    } catch (err) {
        uniChatLogger.error(err.message, err);
        uniChat.dispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: err.stack });
    }
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    uniChatPreInit();
} else {
    document.addEventListener("DOMContentLoaded", uniChatPreInit);
}
