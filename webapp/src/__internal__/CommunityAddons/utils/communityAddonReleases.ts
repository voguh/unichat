/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { AddonRelease, CommunityAddon } from "unichat/types/addons";

export function getReleases(detail: CommunityAddon | null): AddonRelease[] {
    if (detail != null) {
        return detail.releases ?? [];
    }

    return [];
}

export function getLatestStable(releases: AddonRelease[], fallback: string): string {
    const stable = releases.find((release) => !release.prerelease);
    if (stable != null) {
        return stable.name;
    }

    return fallback;
}

export function getDescription(detail: CommunityAddon | null): string | null {
    if (detail != null) {
        return detail.description;
    }

    return null;
}

export async function resolveInstallRelease(
    addon: CommunityAddon,
    fetchDetail: (internalId: string) => Promise<CommunityAddon>
): Promise<string> {
    const detail = await fetchDetail(addon.internalId);

    return getLatestStable(getReleases(detail), addon.version);
}
