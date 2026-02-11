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

export const WidgetsModalStyledContainer = styled.div`
    position: relative;

    > .accordion {
        > .accordion-item {
            > .accordion-collapse {
                > .accordion-body {
                    padding: 0;

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
                                    background-color: var(--oc-dark-5);
                                }

                                &:nth-child(even) {
                                    background-color: var(--oc-dark-4);
                                }

                                > td {
                                    height: var(--cell-height);
                                    min-width: var(--cell-min-width);
                                    padding: var(--cell-padding-y) var(--cell-padding-x);
                                    text-align: left;

                                    &.widget-name {
                                        vertical-align: middle;

                                        > span {
                                            font-weight: bolder;
                                            font-size: 14px;
                                            white-space: nowrap;
                                            overflow: hidden;
                                            text-overflow: ellipsis;
                                        }
                                    }

                                    &.plugin-actions {
                                        width: calc(127px + var(--cell-padding-x) * 2);

                                        > div {
                                            display: flex;
                                            justify-content: flex-end;
                                            align-items: center;
                                            gap: 8px;

                                            > button {
                                                white-space: nowrap;
                                                height: 30px;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
