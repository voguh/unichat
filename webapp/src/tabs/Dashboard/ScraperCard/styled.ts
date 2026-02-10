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

export const ScraperCardStyledContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: 8px;

    > div {
        flex: 1;
    }

    > button {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
    }

    > button:nth-of-type(2) {
        padding: 0;
        width: 36px;
    }
`;

export const ScraperBadgesWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: 8px;
    position: absolute;
    top: 8px;
    right: 8px;
`;
