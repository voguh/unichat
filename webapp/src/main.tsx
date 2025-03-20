import "normalize.css";
import 'react-toastify/dist/ReactToastify.css'
import '@fortawesome/fontawesome-free/css/all.css'
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

import App from "./App";

const root = createRoot(document.querySelector("#root"));
root.render(<App />);
