/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const PluginOverviewStyledContainer = styled.div`
    position: relative;
    height: calc(100vh - (60px + 36px + 16px + 16px));
    display: grid;
    grid-template-rows: 200px 1fr;
    gap: 16px;

    > .plugin-details {
        border: 1px solid var(--mantine-color-dark-4);
        display: grid;
        grid-template-columns: 198px 1fr;
        gap: 16px;

        > .plugin-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 198px;
            height: 198px;

            > img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        > .plugin-meta {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: 42px 42px 1fr;
            grid-template-areas:
                "PN PN PN PN PN PN PN PV PV PV PS PS"
                "PA PA PA PA PA PL PL PH PH PH PH PH"
                "PD PD PD PD PD PD PD PD PD PD PD PD";
            gap: 8px;

            > div {
                align-self: center;

                > .details-label {
                    font-size: 12px;
                    color: var(--mantine-color-dark-3);
                }

                > .details-value {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-clamp: 1;
                }
            }

            > .plugin-name {
                grid-area: PN;
            }

            > .plugin-version {
                grid-area: PV;
            }

            > .plugin-status {
                grid-area: PS;
            }

            > .plugin-authors {
                grid-area: PA;
            }

            > .plugin-license {
                grid-area: PL;
            }

            > .plugin-homepage {
                grid-area: PH;

                > .details-value {
                    color: var(--mantine-color-blue-6);
                    cursor: pointer;
                }
            }

            > .plugin-description {
                grid-area: PD;
                align-self: start;
            }
        }
    }

    > .plugin-messages {
    }
`;
