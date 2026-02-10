/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { UniChatAuthorType, UniChatBadge, UniChatPlatform } from "unichat-widgets/unichat";

export function randomizeBadgeAndAuthorType(
    plt: UniChatPlatform,
    rng: () => number
): [UniChatBadge[], UniChatAuthorType] {
    let authorType: UniChatAuthorType = "VIEWER";
    const badges: UniChatBadge[] = [];

    if (plt === "twitch" && rng() < 0.5) {
        authorType = "MODERATOR";
        badges.push({
            code: "moderator/1",
            url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3"
        });
    }

    if (rng() < 0.5) {
        authorType = "SPONSOR";
        if (plt === "youtube") {
            badges.push({
                code: "sponsor",
                url: "/ytimg/gAq7jDekvG5e_Az-VnKhS-Sy-rZDgyHIdGQAhks2iWlN7rMkiTlxnW5ztMW96ynyEIG1hMe67LLLCP6q=s16-c-k" // prettier-ignore
            });
        } else {
            badges.push({
                code: "subscriber/6",
                url: "https://static-cdn.jtvnw.net/badges/v1/ed51a614-2c44-4a60-80b6-62908436b43a/3"
            });
        }
    }

    if (plt === "twitch") {
        if (rng() < 0.5) {
            badges.push({
                code: "partner/1",
                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3"
            });
        } else if (rng() < 0.5) {
            badges.push({
                code: "twitch-dj/1",
                url: "https://static-cdn.jtvnw.net/badges/v1/cf91bbc0-0332-413a-a7f3-e36bac08b624/3"
            });
        }
    }

    if (plt === "youtube" && rng() < 0.5) {
        authorType = "MODERATOR";
        badges.push({
            code: "moderator",
            url: "/assets/youtube/YouTubeModeratorV2.png"
        });
    }

    if (plt === "youtube") {
        if (rng() < 0.5) {
            badges.push({
                code: "verified",
                url: "/assets/youtube/YouTubeVerified.png"
            });
        } else if (rng() < 0.5) {
            badges.push({
                code: "verified-artist",
                url: "/assets/youtube/YouTubeArtist.png"
            });
        }
    }

    return [badges, authorType];
}
