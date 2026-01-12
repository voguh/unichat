/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

class UniChatLogger {
    get scraperId() {
        return "{{SCRAPER_ID}}";
    }

    trace(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        this.#dispatchLog("trace", formatted)

        if (throwable) {
            this.#dispatchThrowable(throwable);
        }
    }

    debug(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        this.#dispatchLog("debug", formatted)

        if (throwable) {
            this.#dispatchThrowable(throwable);
        }
    }

    info(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        this.#dispatchLog("", formatted)

        if (throwable) {
            this.#dispatchThrowable(throwable);
        }
    }

    warn(message, ...args) {
        const { formatted, throwable } = this.#format(message, args);
        this.#dispatchLog("warn", formatted)

        if (throwable) {
            this.#dispatchThrowable(throwable);
        }
    }

    error(message, ...args) {
        if (message instanceof Error && args.length === 0) {
            args.push(message);
            message = message.message;
        }

        const { formatted, throwable } = this.#format(message, args);
        this.#dispatchLog("error", formatted)

        if (throwable) {
            this.#dispatchThrowable(throwable);
        }
    }

    #dispatchLog(level, message) {
        if (!["trace", "debug", "info", "warn", "error"].includes(level)) {
            level = "info";
        }

        __TAURI_PLUGIN_LOG__[level](`[UniChat Scraper - ${this.scraperId}] ${message}`).catch(console.error);
        console[level](message);
    }

    #dispatchThrowable(throwable) {
        __TAURI_PLUGIN_LOG__.error(`[UniChat Scraper - ${this.scraperId}] ${throwable.stack}`).catch(console.error);
        console.error(throwable);
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

        return { formatted, throwable };
    }
}

/** @type {UniChatLogger} */
globalThis.uniChatLogger = globalThis.uniChatLogger || new UniChatLogger();

/* ================================================================================================================== */

class UniChat {
    get scraperId() {
        return "{{SCRAPER_ID}}";
    }

    async dispatchEvent(payload) {
        if (payload == null || typeof payload !== "object") {
            throw new Error("Payload must be a non-null object.");
        }

        if (payload.type == null || typeof payload.type !== "string" || payload.type.trim() === "") {
            throw new Error("Payload must have a non-empty string 'type' property.");
        }

        payload.scraperId = this.scraperId;
        payload.timestamp = Math.floor(Date.now() / 1000);

        uniChatLogger.debug("Dispatching event of type '{}'", payload.type);
        await __TAURI__.event.emitTo(this.scraperId, "unichat://scraper_event", payload)
            .then(() => uniChatLogger.debug("Event of type '{}' dispatched successfully", payload.type))
            .catch((err) => uniChatLogger.error(err.message, err));
    }
}

/** @type {UniChat} */
globalThis.uniChat = globalThis.uniChat || new UniChat();

/* ================================================================================================================== */

function registerIntermittentEventDispatcher(type) {
    async function dispatch() {
        await uniChat.dispatchEvent({ type });
    }
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

{{SCRAPER_JS}}

/* ================================================================================================================== */

async function uniChatPreInit() {
    try {
        if (window.location.href.startsWith("tauri://") || window.location.href.startsWith("http://localhost")) {
            uniChatLogger.info("Scraper is not running, setting up idle dispatch.");
            registerIntermittentEventDispatcher("idle");
            return;
        }

        uniChatLogger.info("UniChat scraper initializing...")
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
            throw new Error("UniChat scraper initialization function not found.");
        }

        uniChatLogger.info("Calling uniChatInit...");
        const payload = await uniChatInit();

        uniChat.dispatchEvent({ type: "ready", url: window.location.href, ...payload });
        uniChatLogger.info("UniChat scraper initialized.");

        registerIntermittentEventDispatcher("ping");
    } catch (err) {
        uniChatLogger.error(err.message, err);
        uniChat.dispatchEvent({ type: "fatal", message: err.message, stack: err.stack });
    }
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    uniChatPreInit();
} else {
    document.addEventListener("DOMContentLoaded", uniChatPreInit);
}
