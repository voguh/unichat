/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const PluginOverviewStyledContainer = styled.div`
    position: relative;
    height: var(--modal-body-inner-max-height);
    display: grid;
    grid-template-rows: 208px 1fr;
    gap: 8px;

    > .plugin-details {
        border-radius: 4px;
        display: grid;
        grid-template-columns: 190px 1fr;
        gap: 16px;
        overflow: hidden;
        padding: 8px;
        background: var(--oc-dark-4);

        > .plugin-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 190px;
            height: 190px;

            > img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 4px;
            }
        }

        > .plugin-meta {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: 42px 42px calc(42px + (24px * 2));
            grid-template-areas:
                "PN PN PN PN PN PN PN PV PV PV PS PS"
                "PA PA PA PL PL PH PH PH PH PH PH PH"
                "PD PD PD PD PD PD PD PD PD PD PD PD";
            gap: 8px;

            > div {
                align-self: center;

                > .details-label {
                    font-size: 12px;
                    opacity: 0.75;
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
                    color: var(--oc-blue-6);
                    cursor: pointer;
                }
            }

            > .plugin-description {
                grid-area: PD;

                > .details-value {
                    height: calc(24px * 3);
                    overflow-y: auto;
                    white-space: normal;
                    line-clamp: unset;
                }
            }
        }
    }

    > .plugin-messages {
        background: var(--oc-dark-7);
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 0;
    }
`;
