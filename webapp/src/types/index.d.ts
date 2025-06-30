/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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
