/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const ScrapperCardStyledContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: 8px;

    &:not(:first-child) {
        margin-top: 8px;
    }

    > .mantine-TextInput-root {
        flex: 1;
    }

    > button:nth-of-type(2) {
        padding: 0;
        width: 36px;
    }
`;
