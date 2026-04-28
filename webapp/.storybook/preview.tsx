/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "@fortawesome/fontawesome-free/css/all.min.css";
import "tailwindcss/base.css";
import "tailwindcss/components.css";
import "tailwindcss/utilities.css";

import { h } from "preact";

import type { Preview } from "@storybook/preact-vite";
import { setup } from "goober";

setup(h);
const preview: Preview = {
    tags: ["autodocs"],
    decorators: [
        (Story) => {
            return (
                <div
                    className="relative overflow-hidden bg-stone-950 text-stone-50 overflow-y-scroll flex justify-center items-center"
                    style={{ width: "100vw", height: "100vh", margin: "-16px", fontSize: "14px" }}
                >
                    <Story />
                </div>
            );
        }
    ]
};

export default preview;
