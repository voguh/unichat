/*!******************************************************************************
 * UniChat
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "./styles/bootstrap.scss";
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

    window.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });

    const documentRoot = document.querySelector("#root");
    if (documentRoot == null) {
        throw new Error("Root element not found");
    }

    const root = createRoot(documentRoot);
    root.render(
        <React.StrictMode>
            <AppContextProvider>UniChat works!</AppContextProvider>
        </React.StrictMode>
    );
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}
