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

export const GalleyTabEmptyStyledContainer = styled.div`
    width: 100%;
    height: 217px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    > .media-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 224px;
        height: 126px;
        background-color: var(--oc-gray-9);

        > img {
            max-width: 224px;
            max-height: 126px;
            object-fit: contain;
        }

        > video {
            max-width: 224px;
            max-height: 126px;
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

        > .form-group {
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
