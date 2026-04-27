/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { styled } from "goober";
import tw from "twin.macro";

export const DashboardStyledContainer = styled.div({
    "--unichat-dashboard-preview-width": "401px",

    ...tw`relative`,
    width: "var(--unichat-content-width)",
    height: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr var(--unichat-dashboard-preview-width)",
    gridTemplateRows: "1fr",

    "> .scrapers": {
        ...tw`p-2 flex flex-col gap-2`,
        gridColumn: "1"
    },

    "> .preview": {
        "--unichat-dashboard-preview-inner-width": "calc(var(--unichat-dashboard-preview-width) - 1px)", // 1px for border

        ...tw`relative bg-stone-900 border-l border-stone-800`,
        gridColumn: "2",

        "> .preview__header": {
            ...tw`p-2 relative flex gap-2`,
            width: "var(--unichat-dashboard-preview-inner-width)",

            "> button": {
                ...tw`p-0 flex justify-center items-center shrink-0`,
                width: "36px",
                height: "36px"
            }
        },

        "> .preview__iframe-wrapper": {
            height: "calc(100% - 50px)",

            "> iframe": {
                width: "100%",
                height: "100%",
                border: "none",
                pointerEvents: "none",
                background: "white"
            }
        },

        "> .preview__disabled": {
            ...tw`flex justify-center items-center`,
            width: "var(--unichat-dashboard-preview-inner-width)",
            height: "100vh",

            "> div": {
                ...tw`flex flex-col justify-center items-center gap-4 text-center`,

                "> .preview__disabled-icons": {
                    position: "relative",

                    "> i.fa-desktop": {
                        ...tw`text-stone-600/70`
                    },

                    "> i.fa-times": {
                        ...tw`text-stone-500`,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, calc(-50% - 3px))"
                    }
                },

                "> .preview__disabled-text": {
                    ...tw`text-stone-300`
                }
            }
        }
    }
});
