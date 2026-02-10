/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { PluginStatus, WidgetSourceType } from "unichat/utils/constants";

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
    licenses: string;
}

export interface UniChatRelease {
    id: number;
    name: string;
    description: string;
    url: string;
    prerelease: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface UniChatReleaseInfo {
    hasUpdate: boolean;
    latestStable: UniChatRelease | null;
    latestUnstable: UniChatRelease | null;
}

/* ========================================================================== */

export interface GalleryItem {
    title: string;
    type: "image" | "video" | "audio" | "file";
    previewUrl: string;
    url: string;
}

/* ========================================================================== */

export interface UniChatPluginMetadata {
    name: string;
    description?: string;
    version: string;
    author?: string;
    license?: string;
    homepage?: string;
    dependencies: string[];

    icon?: string;
    status: PluginStatus;
    messages: string[];
    pluginPath?: string;
}

/* ========================================================================== */

export interface UniChatScraper {
    id: string;
    name: string;
    editingTooltipMessage: string;
    editingTooltipUrls: string[];
    placeholderText: string;
    badges: string[];
    icon: string;
}

/* ========================================================================== */

export interface UniChatWidget {
    restPath: string;
    widgetSource: UniChatWidgetSource;
}

export interface UniChatWidgetSource {
    type: WidgetSourceType;
    value?: string;
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
    type: "number";
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

export interface WidgetFieldsFilePicker {
    type: "filepicker";
    group?: string;
    label: string;
    description?: string;
    value?: string;
    fileType: ("image" | "video" | "audio" | "file")[];
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
    | WidgetFieldsFilePicker
    | WidgetFieldsDivider;

/* ========================================================================== */
