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

export const GalleyCustomDisplayStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`flex flex-col gap-4 justify-center items-center mx-auto`,
    gridColumn: "1 / -1",
    width: "300px",

    "> .media-wrapper": {
        ...tw`w-full bg-gray-200 rounded flex justify-center items-center overflow-hidden`,
        aspectRatio: "16 / 9",

        "& > img, & > video, & > audio": {
            width: "100%",
            height: "100%",
            objectFit: "contain"
        }
    },

    "> .input-wrapper": {
        ...tw`w-full flex justify-center items-end gap-2`
    }
});
