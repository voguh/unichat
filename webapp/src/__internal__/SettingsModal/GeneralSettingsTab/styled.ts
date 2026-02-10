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

export const GeneralSettingsTabStyledContainer = styled.div`
    height: var(--modal-body-inner-max-height);
    position: relative;

    > .tour-section {
        > .btn-group {
            width: 100%;

            > .btn {
                flex: 1;
            }
        }
    }
`;

export const OpenToLANSettingWrapper = styled.div`
    > .alert {
        margin-top: 16px;
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;

        > div {
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        > span {
            flex: 1;
        }
    }
`;
