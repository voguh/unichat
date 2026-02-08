/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

/* eslint-disable @typescript-eslint/no-empty-object-type */
import "styled-components";

declare module "styled-components" {
    type Theme = typeof import("../styles/theme").theme;
    export interface DefaultTheme extends Theme {
        "oc-white": string;
        "oc-white-rgb": string;
        "oc-black": string;
        "oc-black-rgb": string;

        "oc-gray-0": string;
        "oc-gray-0-rgb": string;
        "oc-gray-1": string;
        "oc-gray-1-rgb": string;
        "oc-gray-2": string;
        "oc-gray-2-rgb": string;
        "oc-gray-3": string;
        "oc-gray-3-rgb": string;
        "oc-gray-4": string;
        "oc-gray-4-rgb": string;
        "oc-gray-5": string;
        "oc-gray-5-rgb": string;
        "oc-gray-6": string;
        "oc-gray-6-rgb": string;
        "oc-gray-7": string;
        "oc-gray-7-rgb": string;
        "oc-gray-8": string;
        "oc-gray-8-rgb": string;
        "oc-gray-9": string;
        "oc-gray-9-rgb": string;

        "oc-red-0": string;
        "oc-red-0-rgb": string;
        "oc-red-1": string;
        "oc-red-1-rgb": string;
        "oc-red-2": string;
        "oc-red-2-rgb": string;
        "oc-red-3": string;
        "oc-red-3-rgb": string;
        "oc-red-4": string;
        "oc-red-4-rgb": string;
        "oc-red-5": string;
        "oc-red-5-rgb": string;
        "oc-red-6": string;
        "oc-red-6-rgb": string;
        "oc-red-7": string;
        "oc-red-7-rgb": string;
        "oc-red-8": string;
        "oc-red-8-rgb": string;
        "oc-red-9": string;
        "oc-red-9-rgb": string;

        "oc-pink-0": string;
        "oc-pink-0-rgb": string;
        "oc-pink-1": string;
        "oc-pink-1-rgb": string;
        "oc-pink-2": string;
        "oc-pink-2-rgb": string;
        "oc-pink-3": string;
        "oc-pink-3-rgb": string;
        "oc-pink-4": string;
        "oc-pink-4-rgb": string;
        "oc-pink-5": string;
        "oc-pink-5-rgb": string;
        "oc-pink-6": string;
        "oc-pink-6-rgb": string;
        "oc-pink-7": string;
        "oc-pink-7-rgb": string;
        "oc-pink-8": string;
        "oc-pink-8-rgb": string;
        "oc-pink-9": string;
        "oc-pink-9-rgb": string;

        "oc-grape-0": string;
        "oc-grape-0-rgb": string;
        "oc-grape-1": string;
        "oc-grape-1-rgb": string;
        "oc-grape-2": string;
        "oc-grape-2-rgb": string;
        "oc-grape-3": string;
        "oc-grape-3-rgb": string;
        "oc-grape-4": string;
        "oc-grape-4-rgb": string;
        "oc-grape-5": string;
        "oc-grape-5-rgb": string;
        "oc-grape-6": string;
        "oc-grape-6-rgb": string;
        "oc-grape-7": string;
        "oc-grape-7-rgb": string;
        "oc-grape-8": string;
        "oc-grape-8-rgb": string;
        "oc-grape-9": string;
        "oc-grape-9-rgb": string;

        "oc-violet-0": string;
        "oc-violet-0-rgb": string;
        "oc-violet-1": string;
        "oc-violet-1-rgb": string;
        "oc-violet-2": string;
        "oc-violet-2-rgb": string;
        "oc-violet-3": string;
        "oc-violet-3-rgb": string;
        "oc-violet-4": string;
        "oc-violet-4-rgb": string;
        "oc-violet-5": string;
        "oc-violet-5-rgb": string;
        "oc-violet-6": string;
        "oc-violet-6-rgb": string;
        "oc-violet-7": string;
        "oc-violet-7-rgb": string;
        "oc-violet-8": string;
        "oc-violet-8-rgb": string;
        "oc-violet-9": string;
        "oc-violet-9-rgb": string;

        "oc-indigo-0": string;
        "oc-indigo-0-rgb": string;
        "oc-indigo-1": string;
        "oc-indigo-1-rgb": string;
        "oc-indigo-2": string;
        "oc-indigo-2-rgb": string;
        "oc-indigo-3": string;
        "oc-indigo-3-rgb": string;
        "oc-indigo-4": string;
        "oc-indigo-4-rgb": string;
        "oc-indigo-5": string;
        "oc-indigo-5-rgb": string;
        "oc-indigo-6": string;
        "oc-indigo-6-rgb": string;
        "oc-indigo-7": string;
        "oc-indigo-7-rgb": string;
        "oc-indigo-8": string;
        "oc-indigo-8-rgb": string;
        "oc-indigo-9": string;
        "oc-indigo-9-rgb": string;

        "oc-blue-0": string;
        "oc-blue-0-rgb": string;
        "oc-blue-1": string;
        "oc-blue-1-rgb": string;
        "oc-blue-2": string;
        "oc-blue-2-rgb": string;
        "oc-blue-3": string;
        "oc-blue-3-rgb": string;
        "oc-blue-4": string;
        "oc-blue-4-rgb": string;
        "oc-blue-5": string;
        "oc-blue-5-rgb": string;
        "oc-blue-6": string;
        "oc-blue-6-rgb": string;
        "oc-blue-7": string;
        "oc-blue-7-rgb": string;
        "oc-blue-8": string;
        "oc-blue-8-rgb": string;
        "oc-blue-9": string;
        "oc-blue-9-rgb": string;

        "oc-cyan-0": string;
        "oc-cyan-0-rgb": string;
        "oc-cyan-1": string;
        "oc-cyan-1-rgb": string;
        "oc-cyan-2": string;
        "oc-cyan-2-rgb": string;
        "oc-cyan-3": string;
        "oc-cyan-3-rgb": string;
        "oc-cyan-4": string;
        "oc-cyan-4-rgb": string;
        "oc-cyan-5": string;
        "oc-cyan-5-rgb": string;
        "oc-cyan-6": string;
        "oc-cyan-6-rgb": string;
        "oc-cyan-7": string;
        "oc-cyan-7-rgb": string;
        "oc-cyan-8": string;
        "oc-cyan-8-rgb": string;
        "oc-cyan-9": string;
        "oc-cyan-9-rgb": string;

        "oc-teal-0": string;
        "oc-teal-0-rgb": string;
        "oc-teal-1": string;
        "oc-teal-1-rgb": string;
        "oc-teal-2": string;
        "oc-teal-2-rgb": string;
        "oc-teal-3": string;
        "oc-teal-3-rgb": string;
        "oc-teal-4": string;
        "oc-teal-4-rgb": string;
        "oc-teal-5": string;
        "oc-teal-5-rgb": string;
        "oc-teal-6": string;
        "oc-teal-6-rgb": string;
        "oc-teal-7": string;
        "oc-teal-7-rgb": string;
        "oc-teal-8": string;
        "oc-teal-8-rgb": string;
        "oc-teal-9": string;
        "oc-teal-9-rgb": string;

        "oc-green-0": string;
        "oc-green-0-rgb": string;
        "oc-green-1": string;
        "oc-green-1-rgb": string;
        "oc-green-2": string;
        "oc-green-2-rgb": string;
        "oc-green-3": string;
        "oc-green-3-rgb": string;
        "oc-green-4": string;
        "oc-green-4-rgb": string;
        "oc-green-5": string;
        "oc-green-5-rgb": string;
        "oc-green-6": string;
        "oc-green-6-rgb": string;
        "oc-green-7": string;
        "oc-green-7-rgb": string;
        "oc-green-8": string;
        "oc-green-8-rgb": string;
        "oc-green-9": string;
        "oc-green-9-rgb": string;

        "oc-lime-0": string;
        "oc-lime-0-rgb": string;
        "oc-lime-1": string;
        "oc-lime-1-rgb": string;
        "oc-lime-2": string;
        "oc-lime-2-rgb": string;
        "oc-lime-3": string;
        "oc-lime-3-rgb": string;
        "oc-lime-4": string;
        "oc-lime-4-rgb": string;
        "oc-lime-5": string;
        "oc-lime-5-rgb": string;
        "oc-lime-6": string;
        "oc-lime-6-rgb": string;
        "oc-lime-7": string;
        "oc-lime-7-rgb": string;
        "oc-lime-8": string;
        "oc-lime-8-rgb": string;
        "oc-lime-9": string;
        "oc-lime-9-rgb": string;

        "oc-yellow-0": string;
        "oc-yellow-0-rgb": string;
        "oc-yellow-1": string;
        "oc-yellow-1-rgb": string;
        "oc-yellow-2": string;
        "oc-yellow-2-rgb": string;
        "oc-yellow-3": string;
        "oc-yellow-3-rgb": string;
        "oc-yellow-4": string;
        "oc-yellow-4-rgb": string;
        "oc-yellow-5": string;
        "oc-yellow-5-rgb": string;
        "oc-yellow-6": string;
        "oc-yellow-6-rgb": string;
        "oc-yellow-7": string;
        "oc-yellow-7-rgb": string;
        "oc-yellow-8": string;
        "oc-yellow-8-rgb": string;
        "oc-yellow-9": string;
        "oc-yellow-9-rgb": string;

        "oc-orange-0": string;
        "oc-orange-0-rgb": string;
        "oc-orange-1": string;
        "oc-orange-1-rgb": string;
        "oc-orange-2": string;
        "oc-orange-2-rgb": string;
        "oc-orange-3": string;
        "oc-orange-3-rgb": string;
        "oc-orange-4": string;
        "oc-orange-4-rgb": string;
        "oc-orange-5": string;
        "oc-orange-5-rgb": string;
        "oc-orange-6": string;
        "oc-orange-6-rgb": string;
        "oc-orange-7": string;
        "oc-orange-7-rgb": string;
        "oc-orange-8": string;
        "oc-orange-8-rgb": string;
        "oc-orange-9": string;
        "oc-orange-9-rgb": string;
    }
}
