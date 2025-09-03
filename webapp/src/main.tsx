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

import App from "./App";
import { commandService } from "./services/commandService";

commandService.isDev().then((isDev) => {
    if (!isDev) {
        window.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
        });
    }
});

const root = createRoot(document.querySelector("#root"));
root.render(<App />);
