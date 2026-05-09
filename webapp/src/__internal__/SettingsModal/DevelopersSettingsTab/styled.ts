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

export const DevelopersSettingsTabStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`p-4 flex flex-col justify-center items-center gap-2`,

    "> div": {
        ...tw`w-full`
    },

    "> .scraper-logging-section": {
        "> .scraperLogging_section--buttons": {
            ...tw`mt-4 flex flex-wrap gap-2`,

            "> button": {
                ...tw`flex-1`
            }
        }
    },

    "> .developers_settings--footer": {
        ...tw`absolute bottom-0 left-0 p-4 flex justify-end gap-2`
    }
});
