/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "unichat/styles/global.css";
import { render } from "preact";

import { CustomEventEditor } from "unichat/tabs/WidgetEditor/Emulator/CustomEventEditor";

if (!__IS_DEV__) {
    window.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
}

const documentRoot = document.querySelector("#custom-event-root");
if (documentRoot == null) {
    throw new Error("Root element not found");
}

render(<CustomEventEditor />, documentRoot);
