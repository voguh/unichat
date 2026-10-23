/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

const path = require("node:path");

const tailwindcss = require("@tailwindcss/postcss");

const GLOBAL_STYLESHEET = path.resolve(__dirname, "src/styles/global.css");

/* ========================================================================== */

// Gives every CSS module the Tailwind theme for @apply.
function tailwindReference() {
    return {
        postcssPlugin: "tailwind-reference",
        Once(root, { result, AtRule }) {
            const from = result.opts.from ?? "";
            if (from.endsWith(".module.css")) {
                root.prepend(new AtRule({ name: "reference", params: JSON.stringify(GLOBAL_STYLESHEET) }));
            }
        }
    };
}

tailwindReference.postcss = true;

/* ========================================================================== */

module.exports = {
    plugins: [tailwindReference(), tailwindcss()]
};
