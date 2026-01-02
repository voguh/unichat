/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export interface UniChatRelease {
    id: number;
    name: string;
    description: string;
    url: string;
    draft: boolean;
    immutable: boolean;
    prerelease: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}
