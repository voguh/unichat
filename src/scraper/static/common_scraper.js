/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
// biome-ignore-all format: biome doesn't need to format this file
// biome-ignore-all lint: biome doesn't need to lint this file
/// <reference path="../../../unichat-api/scrapers/globals.d.ts" />

const logLevelsMap = {
    trace: 1,
    debug: 2,
    info: 3,
    warn: 4,
    error: 5
};

class UniChatLogger {
    constructor() {
        this.trace = this.trace.bind(this);
        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
    }

    trace(message, ...args) {
        this.#log("trace", message, args);
    }

    debug(message, ...args) {
        this.#log("debug", message, args);
    }

    info(message, ...args) {
        this.#log("info", message, args);
    }

    warn(message, ...args) {
        this.#log("warn", message, args);
    }

    error(message, ...args) {
        if (message instanceof Error && args.length === 0) {
            args.push(message);
            message = message.message;
        }

        this.#log("error", message, args);
    }

    #log(level, message, args) {
        const { formatted, throwable } = this.#format(message, args);
        this.#emit(level, formatted);
        // console.trace prints a stack trace instead of a trace-level message
        console[level === "trace" ? "debug" : level](formatted);

        if (throwable) {
            this.#emit("error", throwable.stack);
            console.error(throwable);
        }
    }

    #emit(level, data) {
        __TAURI__.core.invoke("plugin:log|log", {
            level: logLevelsMap[level],
            message: data,
            location: "{{SCRAPER_ID}}",
            file: null,
            line: null,
            keyValues: null
        });
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

globalThis.uniChatLogger = globalThis.uniChatLogger || new UniChatLogger();

/* ========================================================================== */

class UniChat {
    get scraperId() {
        return "{{SCRAPER_ID}}";
    }

    constructor() {
        this.dispatchEvent = this.dispatchEvent.bind(this);
    }

    async dispatchEvent(payload) {
        if (payload == null || typeof payload !== "object") {
            throw new Error("Payload must be a non-null object.");
        }

        if (typeof payload.type !== "string" || payload.type.trim() === "") {
            throw new Error("Payload must have a non-empty string 'type' property.");
        }

        payload.scraperId = this.scraperId;
        payload.timestamp = Date.now();

        uniChatLogger.debug("Dispatching event of type '{}'", payload.type);
        try {
            await __TAURI__.event.emitTo(this.scraperId, "unichat://scraper_event", payload);
            uniChatLogger.debug("Event of type '{}' dispatched successfully", payload.type);
        } catch (err) {
            uniChatLogger.error(err.message, err);
        }
    }
}

globalThis.uniChat = globalThis.uniChat || new UniChat();

/* ========================================================================== */

function registerIntermittentEventDispatcher(type) {
    setInterval(() => uniChat.dispatchEvent({ type }), 60000);
}

/* ========================================================================== */

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

        const originalSend = wsInstance.send;
        wsInstance.send = function (data) {
            if (typeof uniChat.preWebSocketSend === "function") {
                data = uniChat.preWebSocketSend(data, { wsInstance, url, protocols }) || data;
            }

            if (typeof uniChat.onWebSocketSend === "function") {
                Promise.try(() => uniChat.onWebSocketSend(data, { wsInstance, url, protocols })).catch(uniChatLogger.error);
            }

            return originalSend.call(this, data);
        };

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
        if (typeof uniChat.preFetch === "function") {
            args = (await uniChat.preFetch(args)) || args;
        }

        if (typeof uniChat.onFetchRequest === "function") {
            Promise.try(() => uniChat.onFetchRequest(args)).catch(uniChatLogger.error);
        }

        const res = await originalFetch.apply(this, args);

        if (typeof uniChat.onFetchResponse === "function") {
            Promise.try(() => uniChat.onFetchResponse(res.clone(), args)).catch(uniChatLogger.error);
        }

        return res;
    };

    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, writable: false });
}

/* ========================================================================== */

{{SCRAPER_JS}}

/* ========================================================================== */

async function uniChatPreInit() {
    try {
        const scheme = window.location.protocol.split(":")[0];
        const host = window.location.hostname;
        const path = window.location.pathname;
        if (["http", "tauri"].includes(scheme) && ["localhost", "tauri.localhost"].includes(host) && path === "/scraper_idle.html") {
            uniChatLogger.info("Scraper is not running, setting up idle dispatch.");
            registerIntermittentEventDispatcher("idle");
            return;
        }

        uniChatLogger.info("UniChat scraper initializing...");
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

        if ("{{IS_DEV}}" !== "true") {
            window.addEventListener("contextmenu", (event) => {
                event.preventDefault();
            });
        }

        if (typeof uniChatInit !== "function") {
            throw new Error("UniChat scraper initialization function not found.");
        }

        uniChatLogger.info("Calling uniChatInit...");
        let payload = await uniChatInit();
        if (payload == null || typeof payload !== "object") {
            payload = {};
        }

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
