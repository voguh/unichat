/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { UniChatPlatform } from "unichat-widgets/unichat";

export function randomizeSponsorTier(plt: UniChatPlatform): string {
    let sponsorTier: string;
    if (plt === "twitch") {
        const tierRoll = Math.random();
        if (tierRoll < 0.33) {
            sponsorTier = "1000";
        } else if (tierRoll < 0.66) {
            sponsorTier = "2000";
        } else {
            sponsorTier = "3000";
        }
    } else {
        const tierRoll = Math.random();
        if (tierRoll < 0.33) {
            sponsorTier = "Tier 1";
        } else if (tierRoll < 0.66) {
            sponsorTier = "Tier 2";
        } else {
            sponsorTier = "Tier 3";
        }
    }

    return sponsorTier;
}

export function randomizeSponsorData(plt: UniChatPlatform): [string, number] {
    const sponsorTier = randomizeSponsorTier(plt);
    const sponsorMonths = Math.floor(Math.random() * 12) + 1;

    return [sponsorTier, sponsorMonths];
}
