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

/* ========================================================================== */

export interface WidgetFieldsText {
    type: "text" | "textarea";
    group?: string;
    label: string;
    description?: string;
    value?: string;
}

export interface WidgetFieldsNumber {
    type: "number" | "slider";
    group?: string;
    label: string;
    description?: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
}

export interface WidgetFieldsCheckbox {
    type: "checkbox";
    group?: string;
    label: string;
    description?: string;
    value?: boolean;
}

export interface WidgetFieldsColorPicker {
    type: "colorpicker";
    group?: string;
    label: string;
    description?: string;
    value?: string;
    withPickerFree?: boolean;
    swatches?: string[];
}

export interface WidgetFieldsDropdown {
    type: "dropdown";
    group?: string;
    label: string;
    description?: string;
    value?: string;
    options: Record<string, string>;
}

export interface WidgetFieldsDivider {
    type: "divider";
    group?: string;
    label?: string;
}

export type WidgetFields =
    | WidgetFieldsText
    | WidgetFieldsNumber
    | WidgetFieldsCheckbox
    | WidgetFieldsColorPicker
    | WidgetFieldsDropdown
    | WidgetFieldsDivider;

/* ========================================================================== */
