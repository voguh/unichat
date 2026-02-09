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

export const ThirdPartyLicensesStyledContainer = styled.div`
    height: var(--modal-body-inner-max-height);
    margin: 0 -16px 0 0;
    padding: 0 16px 0 0;
    overflow-y: scroll;

    > table {
        > thead {
            > tr {
                position: sticky;
                top: 0;
                background: var(--oc-dark-9);

                > th {
                    background: none;
                }
            }
        }
        > tbody {
            > tr {
                &:nth-child(even) {
                    background: var(--oc-dark-7);
                }

                &:nth-child(odd) {
                    background: var(--oc-dark-8);
                }

                &.withLink:hover {
                    cursor: pointer;
                    background: rgba(var(--oc-blue-4-rgb), 0.25);
                }

                > td {
                    background: none;
                    vertical-align: middle;

                    &:first-child {
                        > span {
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            gap: 8px;

                            > .badge {
                                text-transform: uppercase;

                                &[data-source="crate"] {
                                    background: var(--oc-yellow-8);
                                    color: var(--oc-dark-8);
                                }

                                &[data-source="npm"] {
                                    background: var(--oc-blue-8);
                                    color: var(--oc-dark-0);
                                }
                            }
                        }
                    }

                    &:last-child {
                        > span {
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            gap: 8px;

                            > .badge {
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }
`;
