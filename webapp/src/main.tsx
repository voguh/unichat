import "normalize.css";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fontsource/nunito-sans/300"; // Regular
import "@fontsource/nunito-sans/300-italic"; // Regular
import "@fontsource/nunito-sans/400"; // Regular
import "@fontsource/nunito-sans/400-italic"; // Regular
import "@fontsource/nunito-sans/600"; // Semi-bold
import "@fontsource/nunito-sans/600-italic"; // Semi-bold
import "@fontsource/nunito-sans/700"; // Bold
import "@fontsource/nunito-sans/700-italic"; // Bold

import React from "react";
import { createRoot } from "react-dom/client";

import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";

import App from "./App";

function forwardConsole(fnName: string, logger: (message: string) => Promise<void>): void {
    const original = console[fnName];
    console[fnName] = (message) => {
        original(message);
        logger(message);
    };
}

forwardConsole("log", trace);
forwardConsole("debug", debug);
forwardConsole("info", info);
forwardConsole("warn", warn);
forwardConsole("error", error);

const root = createRoot(document.querySelector("#root"));
root.render(<App />);
