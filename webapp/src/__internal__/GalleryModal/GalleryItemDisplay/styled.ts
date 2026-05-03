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

export const GalleryItemDisplayStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full bg-stone-950 p-2 rounded flex flex-col gap-2`,

    "> .gallery-item--name": {
        ...tw`text-sm font-medium text-center text-ellipsis overflow-hidden whitespace-nowrap`
    },

    "> .gallery-item--preview": {
        ...tw`w-full bg-gray-200 rounded flex justify-center items-center overflow-hidden`,
        aspectRatio: "16 / 9",

        "& > img, & > video, & > audio": {
            width: "100%",
            height: "100%",
            objectFit: "contain"
        }
    },

    "> .gallery-item--footer": {
        "> button": {
            ...tw`w-full`
        }
    }
});
