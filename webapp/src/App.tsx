import React from "react";
import { ToastContainer } from "react-toastify";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { ThemeProvider } from "styled-components";

import { Dashboard } from "./components/Dashboard";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme, muiTheme } from "./styles/theme";

export default function App(): JSX.Element {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />

            <MUIThemeProvider theme={muiTheme}>
                <CssBaseline />
                <Dashboard />
                <ToastContainer position="bottom-center" theme="dark" />
            </MUIThemeProvider>
        </ThemeProvider>
    );
}
