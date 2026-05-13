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

export const AboutSettingsTabStyledContainer: ComponentType<HTMLAttributes<HTMLDivElement>> = styled.div({
    ...tw`relative flex flex-col items-center`,
    width: "var(--settings-modal-content-width)",
    height: "var(--settings-modal-content-height)",
    overflow: "hidden",

    "> .app-image": {
        "> img": {
            width: "128px"
        }
    },

    "> .app-name": {
        ...tw`font-semibold mt-4`
    },

    "> .app-version": {
        ...tw`text-sm mt-2 text-stone-500`
    },

    "> .app-homepage": {
        ...tw`mt-4 text-blue-500 cursor-pointer`
    },

    "> .app-description": {
        ...tw`text-sm mt-4 text-stone-500 text-center`
    },

    "> .app-footer": {
        ...tw`absolute bottom-0 left-0 w-full flex justify-between p-4`
    },

    "> .app-credits": {
        ...tw`absolute bg-stone-800 border border-stone-700 rounded p-4`,
        bottom: "-1px",
        left: "16px",
        width: "calc(var(--settings-modal-content-width) - 32px)",
        height: "calc(var(--settings-modal-content-height) / 2)",
        transform: "translateY(100%)",
        transition: "transform 200ms ease",

        "&.isCreditsOpen": {
            bottom: "16px",
            transform: "translateY(0)"
        },

        "> .credits-data": {
            height: "calc(100% - (36px + 32px))",
            fontSize: "12px",

            "> div": {
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateAreas: `"LT RT"`,
                gap: "8px",

                "> div.label": {
                    ...tw`font-bold text-right`,
                    gridArea: "LT"
                },

                "> div.values": {
                    ...tw`text-stone-50 text-left`,
                    gridArea: "RT"
                }
            }
        },

        "> .credits-footer": {
            width: "100%",
            marginTop: "32px",
            display: "flex",
            justifyContent: "center"
        }
    }
});
