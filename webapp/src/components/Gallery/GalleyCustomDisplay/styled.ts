/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import styled from "styled-components";

export const GalleyTabEmptyStyledContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    > .media-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 231px;
        height: 162px;
        background-color: var(--mantine-color-gray-9);

        > img {
            max-width: 231px;
            max-height: 162px;
            object-fit: contain;
        }

        > video {
            max-width: 231px;
            max-height: 162px;
            object-fit: contain;
        }

        > audio {
            width: calc(100% - 20px);
        }
    }

    > .input-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 8px;
        margin-top: 12px;

        > .mantine-InputWrapper-root {
            flex: 1;
        }

        > button {
            width: 36px;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
`;
