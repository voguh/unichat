import React from "react";
import { ToastContainer } from "react-toastify";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { Dashboard } from "./components/Dashboard";
import { themeDark } from "./styles/theme";

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={themeDark}>
      <CssBaseline />
      <Dashboard />
      <ToastContainer position="bottom-center" theme="dark" />
    </ThemeProvider>
  );
}
