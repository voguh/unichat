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

import { inputGeneralStyle } from "unichat/components/forms/FormGroup";

export const SelectStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`cursor-pointer`,

    "> input": {
        display: "none"
    },

    "> .fake-input": {
        ...inputGeneralStyle
    },

    "> .dropdown-indicator": {
        position: "absolute",
        top: 0,
        right: 0,
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none"
    }
});

export const SelectStyledDropdown: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`w-full p-2 rounded border border-stone-700 bg-stone-800/95 shadow-xl overflow-auto backdrop-blur-sm`,
    maxHeight: "calc(32px * 6)"
});
