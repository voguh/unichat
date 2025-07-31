/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { Dashboard } from "./components/Dashboard";
import { AppContextProvider } from "./contexts/AppContext";

const theme = createTheme({
    fontFamily: "Roboto, sans-serif",
    fontFamilyMonospace: "Roboto Mono, monospace"
});

export default function App(): JSX.Element {
    return (
        <AppContextProvider>
            <MantineProvider defaultColorScheme="dark" theme={theme}>
                <ModalsProvider modalProps={{ centered: true }}>
                    <Notifications position="bottom-center" />
                    <Dashboard />
                </ModalsProvider>
            </MantineProvider>
        </AppContextProvider>
    );
}
