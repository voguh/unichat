/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
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

export const ScraperCardContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`bg-stone-900 border border-stone-800 rounded p-4 shadow-md`,

    "&[data-active=true]": {
        ...tw`bg-green-500/10 border-green-500/50`
    },

    "&[data-loading=true]": {
        ...tw`bg-yellow-500/10 border-yellow-500/50`
    },

    "> .scraper-badges-wrapper": {
        ...tw`flex flex-nowrap items-center mb-2 absolute top-2 right-2`
    },

    "> .scraper-card-body": {
        ...tw`flex flex-nowrap items-end gap-2`,

        "> div": {
            ...tw`flex-1`
        },

        "> button": {
            ...tw`flex justify-center items-center gap-2`
        }
    }
});

export const ScraperLabel: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`flex flex-nowrap items-center gap-2 mb-2`,

    "> .scraper-icon": {
        ...tw`w-8 h-8 rounded shrink-0 flex justify-center items-center bg-stone-500/50 border border-stone-500`,

        "&[data-active=true]": {
            ...tw`bg-green-500/50 border-green-500/50`
        },

        "&[data-loading=true]": {
            ...tw`bg-yellow-500/50 border-yellow-500/50`
        }
    }
});
