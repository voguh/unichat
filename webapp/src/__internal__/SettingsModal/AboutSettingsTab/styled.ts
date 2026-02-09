/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const AboutSettingsTabStyledContainer = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;

    > div {
        > span {
            text-decoration: underline;
            cursor: pointer;
            color: var(--oc-blue-4);
        }
    }

    > .app-image {
        > img {
            width: 128px;
        }
    }

    > .app-name {
        font-weight: 600;
        margin-top: 16px;
    }

    > .app-version {
        font-size: 12px;
        margin-top: 8px;
        color: var(--oc-dark-1);
    }

    > .app-homepage {
        margin-top: 16px;
    }

    > .app-description {
        font-size: 12px;
        text-align: center;
    }

    > .app-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    > .app-credits {
        position: absolute;
        bottom: -1px;
        left: 0;
        height: 50%;
        width: 100%;
        background: var(--oc-dark-7);
        transform: translateY(100%);
        transition: transform 200ms ease;
        border: 1px solid var(--oc-dark-5);
        border-radius: var(--bs-border-radius);
        padding: 16px;

        &.isCreditsOpen {
            bottom: 0;
            transform: translateY(0);
        }

        > .credits-data {
            height: calc(100% - (36px + 32px));
            font-size: 12px;

            > div {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-areas: "LT RT";
                gap: 8px;

                > div.label {
                    grid-area: LT;
                    text-align: right;
                    font-weight: bold;
                }

                > div.values {
                    grid-area: RT;
                    text-align: left;
                    color: var(--oc-dark-1);

                    > p {
                        margin: 0;
                    }
                }
            }
        }

        > .credits-footer {
            width: 100%;
            margin-top: 32px;
            display: flex;
            justify-content: center;
        }
    }
`;
