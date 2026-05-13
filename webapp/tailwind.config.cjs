/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/* eslint-disable @typescript-eslint/no-require-imports */

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
        screens: {
            sm: "40rem",
            md: "48rem",
            lg: "64rem",
            xl: "80rem"
        },
        container: {
            center: true
        }
    },
    plugins: [require("@tailwindcss/typography")]
};
