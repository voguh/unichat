/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fontsource/roboto/400";
import "@fontsource/roboto/400-italic";
import "@fontsource/roboto/600";
import "@fontsource/roboto/600-italic";
import "@fontsource/roboto/700";
import "@fontsource/roboto/700-italic";
import "@fontsource/roboto-mono/400";
import "@fontsource/roboto-mono/400-italic";
import "@fontsource/roboto-mono/600";
import "@fontsource/roboto-mono/600-italic";
import "@fontsource/roboto-mono/700";
import "@fontsource/roboto-mono/700-italic";

import React from "react";
import { createRoot } from "react-dom/client";

import { debug, error, info, trace, warn } from "@tauri-apps/plugin-log";

import App from "unichat/App";
import { AppContextProvider } from "unichat/contexts/AppContext";
import { commandService } from "unichat/services/commandService";

import { LoggerUtil } from "./logging/LoggerUtil";

/* ============================================================================================== */

globalThis.logger$withLogger = function (file, line) {
    return {
        trace: (message, ...args) => LoggerUtil.doLog("trace", file, line, message, ...args),
        debug: (message, ...args) => LoggerUtil.doLog("debug", file, line, message, ...args),
        info: (message, ...args) => LoggerUtil.doLog("info", file, line, message, ...args),
        warn: (message, ...args) => LoggerUtil.doLog("warn", file, line, message, ...args),
        error: (message, ...args) => LoggerUtil.doLog("error", file, line, message, ...args)
    };
};

// Fallback loggers implementation to don't fail if replacement does not happen
globalThis.logger$trace ??= (...args) => trace(args.map((arg) => String(arg)).join("\t"));
globalThis.logger$debug ??= (...args) => debug(args.map((arg) => String(arg)).join("\t"));
globalThis.logger$info ??= (...args) => info(args.map((arg) => String(arg)).join("\t"));
globalThis.logger$warn ??= (...args) => warn(args.map((arg) => String(arg)).join("\t"));
globalThis.logger$error ??= (...args) => error(args.map((arg) => String(arg)).join("\t"));

/* ============================================================================================== */

commandService.isDev().then((isDev) => {
    if (!isDev) {
        window.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
        });
    }
});

const documentRoot = document.querySelector("#root");
if (documentRoot == null) {
    throw new Error("Root element not found");
}

const root = createRoot(documentRoot);
root.render(
    <React.StrictMode>
        <AppContextProvider>
            <App />
        </AppContextProvider>
    </React.StrictMode>
);
