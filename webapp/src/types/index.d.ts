/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export interface Dimensions {
    width: number;
    height: number;
}

export interface ThirdPartyLicenseInfo {
    source: string;
    name: string;
    version: string;
    authors?: string[];
    repository?: string;
    licenses: string[];
}

export interface AppMetadata {
    displayName: string;
    identifier: string;
    version: string;
    description: string;
    authors: string;
    homepage: string;
    icon: number[];
    licenseCode: string;
    licenseName: string;
    licenseUrl: string;

    licenseFile: string;
    widgetsDir: string;

    thirdPartyLicenses?: ThirdPartyLicenseInfo[];
}
