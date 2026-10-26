/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "unichat/styles/global.css";
import { render } from "preact";

import { App } from "unichat/App";
import { CustomEventEditor } from "unichat/tabs/WidgetEditor/Emulator/CustomEventEditor";

if (!__IS_DEV__) {
    window.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
}

const appRoot = document.querySelector("#root");
const customEventRoot = document.querySelector("#custom-event-root");
if (appRoot != null) {
    render(<App />, appRoot);
} else if (customEventRoot != null) {
    render(<CustomEventEditor />, customEventRoot);
} else {
    throw new Error("Root element not found");
}
