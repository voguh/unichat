/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { ComponentType, HTMLAttributes } from "preact";

import { styled } from "goober";
import tw from "twin.macro";

export const CheckUpdatesSettingsTabStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({});

export const ReleaseNotesWrapper: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    "> .release-name": {
        ...tw`flex items-center justify-between mb-4`,

        "> .release-data": {
            ...tw`text-xl font-semibold flex items-center gap-2`
        },

        "> .release-download": {}
    }
});
