/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { styled } from "goober";
import tw from "twin.macro";

export const QRCodeModalStyledContainer = styled.div({
    ...tw`w-full h-full flex flex-col justify-center items-center gap-4`,

    "> .qrcode-label": {
        ...tw`text-stone-100 text-center`
    },

    "> .qrcode": {
        ...tw`bg-white`,
        width: "256px",
        height: "256px"
    },

    "> .qrcode-url": {
        ...tw`w-full flex items-center gap-2`,

        "> button": {
            ...tw`p-0 flex justify-center items-center flex-shrink-0`,
            width: "36px",
            height: "36px"
        }
    }
});
