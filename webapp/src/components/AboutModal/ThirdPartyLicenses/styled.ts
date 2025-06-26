/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import { alpha } from "@mantine/core";
import styled from "styled-components";

export const ThirdPartyLicensesStyledContainer = styled.div`
    height: 100%;
    overflow-y: scroll;

    > table {
        > tbody {
            > tr {
                &:hover {
                    background-color: ${alpha("var(--mantine-color-anchor)", 0.25)};
                }

                > td {
                    > .withLink {
                        cursor: pointer;
                    }

                    > .mantine-Badge-root {
                        cursor: pointer;
                    }
                }
            }
        }
    }
`;
