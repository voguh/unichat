/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "unichat/styles/bootstrap.scss";
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

import { platform } from "@tauri-apps/plugin-os";
import { DefaultTheme, ThemeProvider } from "styled-components";

import { ModalContainer } from "unichat/__internal__/ModalContainer";
import { ToastContainer } from "unichat/__internal__/ToastContainer";
import { App } from "unichat/App";
import { AppContextProvider } from "unichat/contexts/AppContext";
import { BootstrapFixes } from "unichat/styles/BootstrapFixes";
import { GlobalStyle } from "unichat/styles/GlobalStyle";
import { theme } from "unichat/styles/theme";

if (!("__IS_DEV__" in globalThis)) {
    Object.defineProperty(globalThis, "__IS_DEV__", {
        value: import.meta.env.DEV,
        writable: false,
        configurable: false,
        enumerable: true
    });
}

if (!("__PLATFORM__" in globalThis)) {
    Object.defineProperty(globalThis, "__PLATFORM__", {
        value: platform(),
        writable: false,
        configurable: false,
        enumerable: true
    });
}

if (!__IS_DEV__) {
    window.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
}

document.documentElement.setAttribute("data-bs-theme", "dark");
const documentRoot = document.querySelector("#root");
if (documentRoot == null) {
    throw new Error("Root element not found");
}

const root = createRoot(documentRoot);
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme as DefaultTheme}>
            <GlobalStyle />
            <BootstrapFixes />

            <AppContextProvider>
                <App />
                <ToastContainer limit={3} position="bottom-center" />
                <ModalContainer centered />
            </AppContextProvider>
        </ThemeProvider>
    </React.StrictMode>
);
