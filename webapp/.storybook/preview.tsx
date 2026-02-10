/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import "../src/styles/bootstrap.scss";
import React from "react";

import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { ThemeProvider } from "styled-components";
import type { Preview } from "@storybook/react-vite";

import { GlobalStyle } from "../src/styles/GlobalStyle";
import { BootstrapFixes } from "../src/styles/BootstrapFixes";
import { theme } from "../src/styles/theme";

const preview: Preview = {
    parameters: {
        viewport: {
            defaultViewport: 'default',
            options: {
                default: {
                    name: "Default",
                    styles: {
                        width: "1024px",
                        height: "576px"
                    }
                }
            }
        }
    },
    globalTypes: {
        theme: {
            name: "Theme",
            description: "Bootstrap theme",
            "defaultValue": "dark",
            toolbar: {
                icon: 'circlehollow',
                items: ['light', 'dark'],
            }
        }
    },
    decorators: [
        (Story, context) => {
            const themeVariant = context.globals.theme || 'dark';

            React.useEffect(() => {
                document.documentElement.setAttribute('data-bs-theme', themeVariant);
                document.body.style.display = "flex";
                document.body.style.justifyContent = "center";
                document.body.style.alignItems = "center";
            }, [themeVariant]);

            return (
            <ThemeProvider theme={theme}>
                <GlobalStyle />
                <BootstrapFixes />
                <Story />
            </ThemeProvider>
        )}
    ]
};

export default preview;
