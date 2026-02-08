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
    }

    #root {
        position: fixed;
        inset: 0;
        padding: 8px;

        display: grid;
        grid-template-areas: "SID CTT";
        grid-template-columns: 50px 1fr;
        grid-template-rows: 1fr;
        gap: 8px;

        > .sidebar {
            grid-area: SID;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            height: 100%;

            > div {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;

                > .divider {
                    width: 100%;
                    height: 0;
                    border-bottom: 1px solid var(--mantine-color-gray-1);
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

    input, textarea, select, button {
        outline: none;
        box-shadow: none !important;
    }

    .btn {
        font-weight: 600;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .tooltip {
        --bs-tooltip-zindex: 1080;
        --bs-tooltip-max-width: 200px;
        --bs-tooltip-padding-x: 0.5rem;
        --bs-tooltip-padding-y: 0.25rem;
        --bs-tooltip-margin: ;
        --bs-tooltip-font-size: 0.875rem;
        --bs-tooltip-color: var(--bs-white);
        --bs-tooltip-bg: var(--bs-body-bg);
        --bs-tooltip-border-radius: var(--bs-border-radius);
        --bs-tooltip-opacity: 1;
        --bs-tooltip-arrow-width: 0.8rem;
        --bs-tooltip-arrow-height: 0.4rem;

        > .tooltip-inner {
            border: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color);
        }
    }

    .card {
        background: var(--bs-gray-dark);

        > .card-header {
            > .card-title {
                margin: 0;
            }
        }

        > .card-body {
            padding: 8px;
        }
    }
`;
