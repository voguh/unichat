/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import styled from "styled-components";

export const QRCodeModalStyledContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    > .qrcode-label {
        font-size: 1rem;
        color: var(--mantine-color-dark-0);
    }

    > .fake-text-input {
        --input-height: calc(2.25rem * var(--mantine-scale));
        height: var(--input-height);
        border: 1px solid var(--mantine-color-dark-4);
        color: var(--mantine-color-text);
        border: calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-dark-4);
        background-color: var(--mantine-color-dark-6);
        border-radius: var(--mantine-radius-default);
        font-size: var(--mantine-font-size-sm);
        display: flex;
        align-items: center;
        padding: 0 calc(var(--input-height) / 3);
    }
`;
