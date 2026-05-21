/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { h, render } from "preact";

import { setup } from "goober";

import { App } from "unichat/App";

if (!__IS_DEV__) {
    window.addEventListener("contextmenu", async (event) => {
        event.preventDefault();
    });
}

const documentRoot = document.querySelector("#root");
if (documentRoot == null) {
    throw new Error("Root element not found");
}

setup(h);
render(<App />, documentRoot);
