/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export interface UniChatAddonManifest {
    name: string;
    description: string | null;
    version: string;
    author: string | null;
    license: string | null;
    homepage: string | null;
    dependencies: string[];
}

/* ========================================================================== */

export interface AddonReleaseAsset {
    id: number;
    name: string;
    size: number;
    digest: string;
    url: string;
    downloadCount: number;
    createdAt: string;
}

export interface AddonRelease {
    id: number;
    name: string;
    description: string;
    url: string;
    prerelease: boolean;
    sourceUrl: string;
    assets: AddonReleaseAsset[];
    createdAt: string;
    publishedAt: string;
}

/* ========================================================================== */

export interface CommunityWidget {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    version: string;
    author: string | null;
    license: string | null;
    homepageUrl: string | null;
    repositoryUrl: string;
    requiresUniChat: string | null;
    stars: number | null;
    updatedAt: string | null;
    releases: AddonRelease[] | null;

    previewUrl: string;
    installedVersion: string | null;
    compatible: boolean;
    hasUpdate: boolean;
    warnings: string[];
}
