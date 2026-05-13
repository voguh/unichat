/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "tailwindcss/base.css";
import "tailwindcss/components.css";
import "tailwindcss/utilities.css";

import { ComponentType, h } from "preact";

import type { Preview } from "@storybook/preact-vite";
import { setup } from "goober";
import { createGlobalStyles } from "goober/global";
import tw from "twin.macro";

setup(h);

const GlobalStyle = createGlobalStyles({
    "html, body, #storybook-root": tw`w-full h-full m-0 p-0 relative overflow-hidden`,
    "#storybook-root": tw`absolute inset-0 flex justify-center items-center bg-stone-950 text-stone-50 overflow-y-scroll`
}) as ComponentType;

const preview: Preview = {
    tags: ["autodocs"],
    decorators: [
        (Story) => {
            const linkFontawesome = document.createElement("link");
            linkFontawesome.rel = "stylesheet";
            linkFontawesome.href = "/fontawesome/css/fontawesome.min.css";
            document.head.append(linkFontawesome);

            const linkFontawesomeBrands = document.createElement("link");
            linkFontawesomeBrands.rel = "stylesheet";
            linkFontawesomeBrands.href = "/fontawesome/css/brands.min.css";
            document.head.append(linkFontawesomeBrands);

            const linkFontawesomeSolid = document.createElement("link");
            linkFontawesomeSolid.rel = "stylesheet";
            linkFontawesomeSolid.href = "/fontawesome/css/solid.min.css";
            document.head.append(linkFontawesomeSolid);

            return (
                <>
                    <Story />
                    <GlobalStyle />
                </>
            );
        }
    ]
};

export default preview;
