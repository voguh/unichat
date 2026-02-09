/*!******************************************************************************
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
        color: var(--oc-dark-0);
    }

    > .fake-text-input {
        --input-height: 2.25rem;

        height: var(--input-height);
        border: 1px solid var(--oc-dark-4);
        color: var(--oc-text);
        border: calc(0.0625rem * var(--mantine-scale)) solid var(--oc-dark-4);
        background-color: var(--oc-dark-6);
        border-radius: var(--bs-border-radius);
        display: flex;
        align-items: center;
        padding: 0 calc(var(--input-height) / 3);
    }
`;
