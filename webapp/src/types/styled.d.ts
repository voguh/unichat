/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

/* eslint-disable @typescript-eslint/no-empty-object-type */
import "styled-components";

declare module "styled-components" {
    type Theme = typeof import("../styles/theme").theme;
    export interface DefaultTheme extends Theme {}
}
