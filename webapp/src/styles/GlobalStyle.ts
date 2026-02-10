/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;

        ${({ theme }) => {
            return Object.entries(theme)
                .map(([key, value]) => `--${key}: ${value};`)
                .join("\n");
        }}
    }

    #root {
        --unichat-root-padding: 8px;
        --unichat-root-gap: 8px;
        --unichat-sidebar-width: 50px;

        position: fixed;
        inset: 0;
        padding: var(--unichat-root-padding);

        display: grid;
        grid-template-areas: "SID CTT";
        grid-template-columns: var(--unichat-sidebar-width) calc(100vw - ((var(--unichat-root-padding) * 2) + var(--unichat-root-gap) + var(--unichat-sidebar-width)));
        grid-template-rows: calc(100vh - (var(--unichat-root-padding) * 2));
        gap: var(--unichat-root-gap);

        > .sidebar {
            grid-area: SID;
            padding: var(--unichat-root-padding);
            display: flex;
            flex-direction: column;
            gap: var(--unichat-root-gap);

            > div {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: var(--unichat-root-gap);

                > .divider {
                    width: 100%;
                    height: 0;
                    border-bottom: 1px solid var(--oc-gray-1);
                    opacity: 0.25;
                    margin: 8px 0;
                }
            }

            button {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 32px;
                height: 32px;
                min-width: 32px;
                min-height: 32px;
                padding: 0;
            }
        }

        > .content {
            grid-area: CTT;
        }
    }
`;
