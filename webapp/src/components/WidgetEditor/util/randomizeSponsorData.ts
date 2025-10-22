/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
