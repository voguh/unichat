/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    addons: ["@storybook/addon-docs"],
    stories: [
        "../__stories__/**/*.mdx",
        "../__stories__/**/*.stories.@(js|jsx|mjs|ts|tsx)"
    ],
    async viteFinal(config, options) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    "unichat": "/src"
                }
            }
        })
    }
};

export default config;
