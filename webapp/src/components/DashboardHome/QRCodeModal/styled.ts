/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
