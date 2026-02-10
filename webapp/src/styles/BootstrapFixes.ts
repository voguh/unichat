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

const colors = [
    ["gray", "secondary"],
    ["red", "danger"],
    ["pink"],
    ["grape"],
    ["violet"],
    ["indigo"],
    ["blue", "primary"],
    ["cyan", "info"],
    ["teal"],
    ["green", "success"],
    ["lime"],
    ["yellow", "warning"],
    ["orange"]
];

function generateButtonStyles(): string {
    const styles: string[] = [];

    for (const variants of colors) {
        const color = variants[0];
        const filledSelectors = variants.map((variant) => `.btn-${variant}`).join(", ");
        const outlineSelectors = variants.map((variant) => `.btn-outline-${variant}`).join(", ");
        styles.push(`
            ${filledSelectors} {
                --bs-btn-color: var(--oc-white);
                --bs-btn-bg: var(--oc-${color}-8);
                --bs-btn-border-color: var(--oc-${color}-8);
                --bs-btn-hover-color: var(--oc-white);
                --bs-btn-hover-bg: var(--oc-${color}-9);
                --bs-btn-hover-border-color: var(--oc-${color}-9);
                --bs-btn-focus-shadow-rgb: ;
                --bs-btn-active-color: var(--oc-white);
                --bs-btn-active-bg: var(--oc-${color}-9);
                --bs-btn-active-border-color: var(--oc-${color}-9);
                --bs-btn-active-shadow: ;
            }

            ${outlineSelectors} {
                --bs-btn-color: var(--oc-${color}-8);
                --bs-btn-border-color: var(--oc-${color}-8);
                --bs-btn-hover-color: var(--oc-${color}-8);
                --bs-btn-hover-bg: rgba(var(--oc-${color}-8-rgb), 0.125);
                --bs-btn-hover-border-color: var(--oc-${color}-8);
                --bs-btn-focus-shadow-rgb: ;
                --bs-btn-active-color: var(--oc-${color}-8);
                --bs-btn-active-bg: rgba(var(--oc-${color}-8-rgb), 0.125);
                --bs-btn-active-border-color: var(--oc-${color}-8);
                --bs-btn-active-shadow: ;
            }

            .btn-light-${color} {
                --bs-btn-color: var(--oc-${color}-8);
                --bs-btn-bg: rgba(var(--oc-${color}-8-rgb), 0.125);
                --bs-btn-border-color: transparent;
                --bs-btn-hover-color: var(--oc-${color}-8);
                --bs-btn-hover-bg: rgba(var(--oc-${color}-8-rgb), 0.25);
                --bs-btn-hover-border-color: transparent;
                --bs-btn-focus-shadow-rgb: ;
                --bs-btn-active-color: var(--oc-${color}-8);
                --bs-btn-active-bg: rgba(var(--oc-${color}-8-rgb), 0.25);
                --bs-btn-active-border-color: transparent;
                --bs-btn-active-shadow: ;
            }
        `);
    }

    return styles.join("\n");
}

export const BootstrapFixes = createGlobalStyle`
    input, textarea, select, button {
        outline: none;
        box-shadow: none !important;
    }

    /* <=======================[ TOOLTIP OR POPOVER ]=======================> */
    .popover {
        /* --bs-popover-zindex: 1070; */
        /* --bs-popover-max-width: 276px; */
        /* --bs-popover-font-size: 0.875rem; */
        /* --bs-popover-bg: var(--bs-body-bg); */
        /* --bs-popover-border-width: var(--bs-border-width); */
        /* --bs-popover-border-color: var(--bs-border-color-translucent); */
        /* --bs-popover-border-radius: var(--bs-border-radius-lg); */
        /* --bs-popover-inner-border-radius: calc(var(--bs-border-radius-lg) - var(--bs-border-width)); */
        /* --bs-popover-box-shadow: var(--bs-box-shadow); */
        /* --bs-popover-header-padding-x: 1rem; */
        /* --bs-popover-header-padding-y: 0.5rem; */
        /* --bs-popover-header-font-size: 1rem; */
        /* --bs-popover-header-color: inherit; */
        /* --bs-popover-header-bg: var(--bs-secondary-bg); */
        /* --bs-popover-body-padding-x: 1rem; */
        /* --bs-popover-body-padding-y: 1rem; */
        /* --bs-popover-body-color: var(--bs-body-color); */
        /* --bs-popover-arrow-width: 1rem; */
        /* --bs-popover-arrow-height: 0.5rem; */
        /* --bs-popover-arrow-border: var(--bs-popover-border-color); */
    }

    .tooltip {
        /* --bs-tooltip-zindex: 1080; */
        /* --bs-tooltip-max-width: 200px; */
        --bs-tooltip-padding-x: 0.75rem;
        --bs-tooltip-padding-y: 0.5rem;
        /* --bs-tooltip-margin: ; */
        --bs-tooltip-font-size: 1rem;
        --bs-tooltip-color: var(--oc-black);
        --bs-tooltip-bg: var(--oc-gray-0);
        /* --bs-tooltip-border-radius: var(--bs-border-radius); */
        --bs-tooltip-opacity: 1;
        /* --bs-tooltip-arrow-width: 0.8rem; */
        /* --bs-tooltip-arrow-height: 0.4rem; */

        > .tooltip-inner {
            border: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color);
        }
    }
    /* <=====================[ END TOOLTIP OR POPOVER ]=====================> */

    /* <=============================[ BUTTON ]=============================> */
    .btn {
        /* --bs-btn-padding-x: 0.75rem; */
        /* --bs-btn-padding-y: 0.375rem; */
        /* --bs-btn-font-family: ; */
        /* --bs-btn-font-size: 1rem; */
        /* --bs-btn-font-weight: 400; */
        /* --bs-btn-line-height: 1.5; */
        /* --bs-btn-color: var(--bs-body-color); */
        /* --bs-btn-bg: transparent; */
        /* --bs-btn-border-width: var(--bs-border-width); */
        /* --bs-btn-border-color: transparent; */
        /* --bs-btn-border-radius: var(--bs-border-radius); */
        /* --bs-btn-hover-border-color: transparent; */
        /* --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075); */
        /* --bs-btn-disabled-opacity: 0.65; */
        /* --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5); */
        --bs-btn-disabled-color: var(--oc-dark-3);
        --bs-btn-disabled-bg: var(--oc-dark-6);
        --bs-btn-disabled-border-color: var(--oc-dark-6);

        min-height: 36px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:disabled {
            cursor: not-allowed;
        }
    }

    .btn-white, .btn-light {
        --bs-btn-color: var(--oc-gray-8);
        --bs-btn-bg: var(--oc-white);
        --bs-btn-border-color: var(--oc-white);
        --bs-btn-hover-color: var(--oc-gray-8);
        --bs-btn-hover-bg: var(--oc-gray-1);
        --bs-btn-hover-border-color: var(--oc-gray-1);
        --bs-btn-focus-shadow-rgb: ;
        --bs-btn-active-color: var(--oc-gray-8);
        --bs-btn-active-bg: var(--oc-gray-1);
        --bs-btn-active-border-color: var(--oc-gray-1);
        --bs-btn-active-shadow: ;
    }

    .btn-outline-white, .btn-outline-light {
        --bs-btn-color: var(--oc-white);
        --bs-btn-border-color: var(--oc-white);
        --bs-btn-hover-color: var(--oc-gray-8);
        --bs-btn-hover-bg: var(--oc-white);
        --bs-btn-hover-border-color: var(--oc-white);
        --bs-btn-focus-shadow-rgb: ;
        --bs-btn-active-color: var(--oc-gray-8);
        --bs-btn-active-bg: var(--oc-white);
        --bs-btn-active-border-color: var(--oc-white);
        --bs-btn-active-shadow: ;
        --bs-btn-disabled-color: var(--oc-white);
        --bs-btn-disabled-bg: transparent;
        --bs-btn-disabled-border-color: var(--oc-white);
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

    ${generateButtonStyles()}
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
            width: 100%;
            margin-bottom: 0;
        }

        > .form-description {
            color: var(--oc-dark-2);
            font-size: 0.875rem;
            width: 100%;
        }

        > .form-control {
            height: 36px;
            background: var(--input-bg);
            border-color: var(--input-bd);

            &:focus {
                border-color: var(--oc-blue-8);
            }
        }

        > .colorpicker-inputgroup {
            display: flex;
            gap: 8px;

            > .color-preview {
                flex-shrink: 0;
                position: relative;
                width: 36px;
                height: 36px;
                border-radius: var(--bs-border-radius);
                overflow: hidden;
                background-image:
                    linear-gradient(45deg, rgb(66, 66, 66) 25%, rgba(0, 0, 0, 0) 25%),
                    linear-gradient(-45deg, rgb(66, 66, 66) 25%, rgba(0, 0, 0, 0) 25%),
                    linear-gradient(45deg, rgba(0, 0, 0, 0) 75%, rgb(66, 66, 66) 75%),
                    linear-gradient(-45deg, rgb(36, 36, 36) 75%, rgb(66, 66, 66) 75%);
                background-position-x:
                    0px,
                    0px,
                    4px,
                    -4px;
                background-position-y:
                    0px,
                    4px,
                    -4px,
                    0px;
                background-size:
                    8px 8px,
                    8px 8px,
                    8px 8px,
                    8px 8px;

                > div {
                    width: 100%;
                    height: 100%;
                }

                > span {
                    position: absolute;
                    inset: 0;
                    box-shadow:
                        rgba(0, 0, 0, 0.1) 0px 0px 0px 1px inset,
                        rgba(0, 0, 0, 0.15) 0px 0px 4px 0px inset;
                }
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
