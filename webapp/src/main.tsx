/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
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

import App from "unichat/App";
import { AppContextProvider } from "unichat/contexts/AppContext";

let initializationAttempts = 0;
function init(): void {
    if (typeof __IS_DEV__ !== "boolean") {
        if (initializationAttempts === 50) {
            throw new Error("Initialization failed: __IS_DEV__ is not defined");
        }

        setTimeout(init, 100);
        initializationAttempts++;

        return;
    }

    if (!__IS_DEV__) {
        window.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
        });
    }

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
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
