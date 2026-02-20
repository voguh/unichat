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
import { exposeItem, exposeModules } from "unichat/lib/expose";
import { BootstrapFixes } from "unichat/styles/BootstrapFixes";
import { GlobalStyle } from "unichat/styles/GlobalStyle";
import { theme } from "unichat/styles/theme";

async function init(): Promise<void> {
    /* ==========================[ EXPOSE MODULES ]========================== */

    exposeItem("@react-input/number-format", await import("@react-input/number-format"));
    exposeItem("@tauri-apps/api", await import("@tauri-apps/api"));
    exposeItem("@tauri-apps/plugin-dialog", await import("@tauri-apps/plugin-dialog"));
    exposeItem("@tauri-apps/plugin-opener", await import("@tauri-apps/plugin-opener"));
    exposeItem("@tauri-apps/plugin-os", await import("@tauri-apps/plugin-os"));
    exposeItem("@uiw/react-color-sketch", await import("@uiw/react-color-sketch"));
    exposeItem("clsx", await import("clsx"));
    exposeItem("clsx/lite", await import("clsx/lite"));
    exposeItem("marked", await import("marked"));
    exposeItem("mitt", await import("mitt"));
    exposeItem("polished", await import("polished"));
    exposeItem("qrcode.react", await import("qrcode.react"));
    exposeItem("react", await import("react"));
    exposeItem("react/jsx-runtime", await import("react/jsx-runtime"));

    const reactBootstrap = await import("react-bootstrap");
    exposeItem("react-bootstrap", reactBootstrap);
    for (const [key, value] of Object.entries(reactBootstrap)) {
        exposeItem(`react-bootstrap/${key}`, { default: value });
    }

    exposeItem("react-dom", await import("react-dom"));
    exposeItem("react-dom/client", await import("react-dom/client"));
    exposeItem("react-select", await import("react-select"));
    exposeItem("react-select/animated", await import("react-select/animated"));
    exposeItem("react-select/async", await import("react-select/async"));
    exposeItem("react-select/async-creatable", await import("react-select/async-creatable"));
    exposeItem("react-select/creatable", await import("react-select/creatable"));
    exposeItem("styled-components", await import("styled-components"));

    exposeModules("unichat/components", import.meta.glob("./components/**/*.{ts,tsx}", { eager: true }));
    exposeModules("unichat/contexts", import.meta.glob("./contexts/**/*.{ts,tsx}", { eager: true }));
    exposeModules("unichat/hooks", import.meta.glob("./hooks/**/*.{ts,tsx}", { eager: true }));
    exposeModules("unichat/logging", import.meta.glob("./logging/**/*.{ts,tsx}", { eager: true }));
    exposeModules("unichat/services", import.meta.glob("./services/**/*.{ts,tsx}", { eager: true }));
    exposeModules("unichat/utils", import.meta.glob("./utils/**/*.{ts,tsx}", { eager: true }));

    /* ========================[ END EXPOSE MODULES ]======================== */
}

/* ============================================================================================== */

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

if (!("__MODULES__" in globalThis)) {
    Object.defineProperty(globalThis, "__MODULES__", {
        value: {},
        writable: false,
        configurable: false,
        enumerable: true
    });
}

/* ============================================================================================== */

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

init();

/* ============================================================================================== */

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
