/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

async function unichatDispatchEvent(payload) {
    const scrapperWebviewWindow = window.__TAURI__.webviewWindow.getCurrentWebviewWindow();
    const label = scrapperWebviewWindow.label;
    const scrapperName = label.replace("-chat", "");

    payload.timestamp = Date.now();
    await window.__TAURI__.event.emit(`${scrapperName}_raw::event`, payload)
        .then(() => {
            console.log(`Dispatched event with type '${payload.type}'.`);
        })
        .catch((err) => {
            console.error("Failed to dispatch event:", err);
            window.__TAURI_PLUGIN_LOG__.error(err);
        });
}

async function unichatDispatchIdle() {
    await unichatDispatchEvent({ type: "idle" });
}

/* ================================================================================================================== */

if (window.WebSocket.__WRAPPED__ !== true) {
    console.log("Wrapping WebSocket to monitor messages.");
    const OriginalWebSocket = window.WebSocket;

    window.WebSocket = function (url, protocols) {
        const wsInstance = protocols ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

        wsInstance.addEventListener("message", async (event) => {
            try {
                const unichat = window.unichat || {};

                if (typeof unichat.onWebSocketMessage === "function") {
                    await unichat.onWebSocketMessage(event, { wsInstance, url, protocols });
                }
            } catch (err) {
                console.error("Failed to process WebSocket message:", err);
                window.__TAURI_PLUGIN_LOG__.error(err);
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
    console.log("Wrapping fetch function to monitor network requests.");
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
        const res = await originalFetch.apply(this, args);

        const unichat = window.unichat || {};
        if (typeof unichat.onFetchResponse === "function") {
            unichat.onFetchResponse(res.clone(), ...args);
        }

        return res;
    }

    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, writable: false });
}

/* ================================================================================================================== */

{{SCRAPPER_JS}}

/* ================================================================================================================== */

function uniChatPreInit() {
    if (window.unichat == null || typeof window.unichat !== "object") {
        window.unichat = {};
    }

    if (window.location.protocol === "tauri:") {
        console.log("Scrapper is not running, setting up idle dispatch.");
        setInterval(unichatDispatchIdle, 5000);
        return;
    }

    console.log("UniChat scrapper initializing...");
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

    window.__TAURI__.core.invoke("is_dev").then((isDev) => {
        if (!isDev) {
            window.addEventListener("contextmenu", async (event) => {
                event.preventDefault();
            });
        }
    });

    uniChatInit();
    console.log("UniChat scrapper initialized.");
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    uniChatPreInit();
} else {
    document.addEventListener("DOMContentLoaded", uniChatPreInit);
}
