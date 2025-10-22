/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import type { UniChatEmote, UniChatPlatform } from "unichat-widgets/unichat";

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

export function randomizeSponsorData(plt: UniChatPlatform): [string, number, string, UniChatEmote[]] {
    const sponsorTier = randomizeSponsorTier(plt);
    const sponsorMonths = Math.floor(Math.random() * 12) + 1;

    const sponsorMessages: [string, UniChatEmote[]][] = [
        [
            "Excited to be a sponsor! peepoClap",
            [
                {
                    id: "5d38aaa592fc550c2d5996b8",
                    code: "peepoClap",
                    url: "https://cdn.betterttv.net/emote/5d38aaa592fc550c2d5996b8/3x.webp"
                }
            ]
        ],
        ["Keep up the great work!", []],
        [
            "This is my first time sponsoring, glad to be here!",
            [
                {
                    id: "614b110eb63cc97ee6d2c224",
                    code: "peepoSit",
                    url: "https://cdn.betterttv.net/emote/614b110eb63cc97ee6d2c224/3x.webp"
                }
            ]
        ]
    ];

    if (plt === "twitch") {
        sponsorMessages.push([
            "Loving the content, had to sponsor! DinoDance",
            [
                {
                    id: "emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7",
                    code: "DinoDance",
                    url: "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_dcd06b30a5c24f6eb871e8f5edbd44f7/default/dark/4.0"
                }
            ]
        ]);
    } else if (plt === "youtube") {
        sponsorMessages.push([
            "Happy to support the channel! face-pink-drinking-tea",
            [
                {
                    id: "WRLIgKpnClgYOZyAwnqP-Edrdxu6_N19qa8gsB9P_6snZJYIMu5YBJX8dlM81YG6H307KA",
                    code: "face-pink-drinking-tea",
                    url: "/ytimg/WRLIgKpnClgYOZyAwnqP-Edrdxu6_N19qa8gsB9P_6snZJYIMu5YBJX8dlM81YG6H307KA=w24-h24-c-k-nd"
                }
            ]
        ]);
    }

    const idx = Math.floor(Math.random() * sponsorMessages.length);
    const [sponsorMessage, sponsorEmotes] = sponsorMessages[idx];

    return [sponsorTier, sponsorMonths, sponsorMessage, sponsorEmotes];
}
