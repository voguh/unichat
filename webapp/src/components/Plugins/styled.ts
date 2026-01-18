/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const PluginsStyledContainer = styled.div`
    position: relative;

    > table {
        --cell-padding-x: 8px;
        --cell-padding-y: 8px;
        --cell-inner-min-width: 30px;
        --cell-inner-height: 30px;
        --cell-min-width: calc(var(--cell-inner-min-width) + var(--cell-padding-x) * 2);
        --cell-height: calc(var(--cell-inner-height) + var(--cell-padding-y) * 2);

        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;

        > tbody {
            > tr {
                &:nth-child(odd) {
                    background-color: var(--mantine-color-dark-7);
                }

                &:nth-child(even) {
                    background-color: var(--mantine-color-dark-6);
                }

                > td {
                    height: var(--cell-height);
                    min-width: var(--cell-min-width);
                    padding: var(--cell-padding-y) var(--cell-padding-x);
                    text-align: left;

                    &.plugin-icon {
                        width: var(--cell-min-width);

                        > img {
                            display: block;
                            width: 30px;
                            height: 30px;
                        }
                    }

                    &.plugin-name {
                        > span {
                            font-weight: bolder;
                            font-size: 14px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }

                    &.plugin-badges {
                        > span {
                            display: flex;
                            justify-content: flex-end;
                            gap: 4px;
                        }
                    }

                    &.plugin-actions {
                        width: calc(67px + var(--cell-padding-x) * 2);
                        text-align: right;
                    }
                }
            }
        }
    }
`;
