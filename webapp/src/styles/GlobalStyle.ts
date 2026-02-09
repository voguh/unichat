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

                > i {
                    font-size: 20px;
                }
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
        --bs-tooltip-padding-x: 0.75rem;
        --bs-tooltip-padding-y: 0.5rem;
        --bs-tooltip-margin: ;
        --bs-tooltip-font-size: 1rem;
        --bs-tooltip-color: var(--oc-black);
        --bs-tooltip-bg: var(--oc-gray-0);
        --bs-tooltip-border-radius: var(--bs-border-radius);
        --bs-tooltip-opacity: 1;
        --bs-tooltip-arrow-width: 0.8rem;
        --bs-tooltip-arrow-height: 0.4rem;

        > .tooltip-inner {
            border: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color);
        }
    }

    /* <=============================[ BUTTON ]=============================> */
    .btn {
        height: 36px;
    }

    .btn-default {
        color: var(--oc-white);
        background: var(--oc-dark-6);
        border-color: var(--oc-dark-4);

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-dark-5) !important;
            border-color: var(--oc-dark-4) !important;
        }
    }

    .btn-primary {
        color: var(--oc-white);
        background: var(--oc-blue-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-blue-9) !important;
            border-color: transparent !important;
        }
    }

    .btn-secondary {
        color: var(--oc-white);
        background: var(--oc-gray-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-gray-9) !important;
            border-color: transparent !important;
        }
    }

    .btn-success {
        color: var(--oc-white);
        background: var(--oc-green-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-green-9) !important;
            border-color: transparent !important;
        }
    }

    .btn-info {
        color: var(--oc-white);
        background: var(--oc-cyan-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-cyan-9) !important;
            border-color: transparent !important;
        }
    }

    .btn-warning {
        color: var(--oc-white);
        background: var(--oc-yellow-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-yellow-9) !important;
            border-color: transparent !important;
        }
    }

    .btn-danger {
        color: var(--oc-white);
        background: var(--oc-red-8);
        border-color: transparent;

        &:hover, &:active, &:focus {
            color: var(--oc-white) !important;
            background: var(--oc-red-9) !important;
            border-color: transparent !important;
        }
    }
    /* <===========================[ END BUTTON ]===========================> */

    /* <==============================[ CARD ]==============================> */
    .card {
        /* --bs-card-spacer-y: 1rem; */
        /* --bs-card-spacer-x: 1rem; */
        /* --bs-card-title-spacer-y: 0.5rem; */
        /* --bs-card-title-color: ; */
        /* --bs-card-subtitle-color: ; */
        /* --bs-card-border-width: var(--bs-border-width); */
        --bs-card-border-color: var(--oc-dark-4);
        /* --bs-card-border-radius: var(--bs-border-radius); */
        /* --bs-card-box-shadow: ; */
        /* --bs-card-inner-border-radius: calc(var(--bs-border-radius) - (var(--bs-border-width))); */
        /* --bs-card-cap-padding-y: 0.5rem; */
        /* --bs-card-cap-padding-x: 1rem; */
        /* --bs-card-cap-bg: rgba(var(--bs-body-color-rgb), 0.03); */
        /* --bs-card-cap-color: ; */
        /* --bs-card-height: ; */
        --bs-card-color: var(--oc-dark-0);
        --bs-card-bg: var(--oc-dark-6);
        /* --bs-card-img-overlay-padding: 1rem; */
        /* --bs-card-group-margin: 0.75rem; */
    }
    /* <============================[ END CARD ]============================> */

    /* <=========================[ END FROM GROUP ]=========================> */
    .form-group {
        --input-bg: var(--oc-dark-6);
        --input-bd: var(--oc-dark-4);

        > .form-label {
            color: var(--oc-dark-0);
        }

        > .form-description {
            color: var(--oc-dark-2);
            font-size: 0.750rem;
        }

        > .form-control {
            height: 36px;
            background: var(--input-bg);
            border-color: var(--input-bd);

            &:focus {
                border-color: var(--oc-blue-8);
            }
        }

        > .react-select__root {
            > .react-select__control {
                min-height: 36px;
                height: 36px;
                color: var(--oc-dark-0);
                background: var(--input-bg);
                border-color: var(--input-bd);

                &.react-select__control--is-focused {
                    border-color: var(--oc-blue-8);
                }

                > .react-select__value-container {
                    height: 34px;

                    > .react-select__single-value {
                        color: var(--oc-dark-0);
                    }

                    > .react-select__input-container {
                        color: var(--oc-dark-0);
                    }
                }

                > .react-select__indicators {
                    height: 34px;

                    > .react-select__indicator-separator {
                        background: var(--oc-dark-0);
                    }

                    > .react-select__indicator {
                        padding: 7px;

                        > svg {
                            > path {
                                fill: var(--oc-dark-0);
                            }
                        }
                    }
                }
            }

            > .react-select__menu {
                background: var(--input-bg);

                > .react-select__menu-list {
                    padding: 8px;

                    > .react-select__group {
                        > .react-select__group-heading {
                            color: var(--oc-dark-2);
                            position: relative;
                            font-weight: 600;
                            font-size: 0.875rem;
                        }
                    }

                    .react-select__option {
                        cursor: pointer;
                        border-radius: 4px;
                    }

                    .react-select__option--is-focused {
                        background: var(--oc-dark-7);
                    }

                    .react-select__option--is-selected {
                        background: var(--oc-dark-5);
                    }
                }
            }
        }

        > .form-error {
            color: var(--oc-red-8);
            font-size: 0.750rem;
        }
    }
    /* <=========================[ END FROM GROUP ]=========================> */
`;
