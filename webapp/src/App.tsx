import React from "react";

import { createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import { Dashboard } from "./components/Dashboard";

const theme = createTheme({
    fontFamily: "Roboto, sans-serif",
    fontFamilyMonospace: "Roboto Mono, monospace"
});

export default function App(): JSX.Element {
    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <ModalsProvider modalProps={{ centered: true }}>
                <Notifications position="top-center" />
                <Dashboard />
            </ModalsProvider>
        </MantineProvider>
    );
}
