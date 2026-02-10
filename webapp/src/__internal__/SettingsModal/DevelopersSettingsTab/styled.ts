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

export const DevelopersSettingsTabStyledContainer = styled.div`
    height: var(--modal-body-inner-max-height);
    position: relative;

    > .create-webview-hidden-section {
    }

    > .scraper-logging-section {
        > .btn-group {
            width: 100%;

            > .btn {
                flex: 1;
            }
        }
    }
`;
