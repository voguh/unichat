/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { randBoolean, randFloat } from "@ngneat/falso";

import type { UniChatAuthorType, UniChatBadge, UniChatPlatform } from "@voguh/unichat-api/widgets/events";

const TWITCH_MODERATOR_BADGE: UniChatBadge = {
    code: "moderator/1",
    url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3"
};

const TWITCH_SUBSCRIBER_BADGE: UniChatBadge = {
    code: "subscriber/6",
    url: "https://static-cdn.jtvnw.net/badges/v1/ed51a614-2c44-4a60-80b6-62908436b43a/3"
};

const YOUTUBE_MODERATOR_BADGE: UniChatBadge = {
    code: "moderator",
    url: "/assets/youtube/YouTubeModeratorV2.png"
};

const YOUTUBE_SPONSOR_BADGE: UniChatBadge = {
    code: "sponsor",
    url: "/proxy/aHR0cHM6Ly95dDMuZ2dwaHQuY29tL2dBcTdqRGVrdkc1ZV9Bei1WbktoUy1TeS1yWkRneUhJZEdRQWhrczJpV2xON3JNa2lUbHhuVzV6dE1XOTZ5bnlFSUcxaE1lNjdMTExDUDZxPXMxNi1jLWs=?referer=https://www.youtube.com/" // prettier-ignore
};

export function badgesForAuthorType(plt: UniChatPlatform, authorType: UniChatAuthorType): UniChatBadge[] {
    if (authorType === "MODERATOR") {
        return plt === "twitch" ? [TWITCH_MODERATOR_BADGE] : plt === "youtube" ? [YOUTUBE_MODERATOR_BADGE] : [];
    } else if (authorType === "SPONSOR") {
        return plt === "twitch" ? [TWITCH_SUBSCRIBER_BADGE] : plt === "youtube" ? [YOUTUBE_SPONSOR_BADGE] : [];
    }

    return [];
}

export function randomizeBadgeAndAuthorType(plt: UniChatPlatform): [UniChatBadge[], UniChatAuthorType] {
    let authorType: UniChatAuthorType = "VIEWER";
    const badges: UniChatBadge[] = [];

    if (plt === "twitch" && randBoolean()) {
        authorType = "MODERATOR";
        badges.push(TWITCH_MODERATOR_BADGE);
    }

    if (randBoolean()) {
        authorType = "SPONSOR";
        badges.push(plt === "youtube" ? YOUTUBE_SPONSOR_BADGE : TWITCH_SUBSCRIBER_BADGE);
    }

    if (plt === "twitch") {
        const roll = randFloat({ min: 0, max: 1 });

        if (roll < 0.5) {
            badges.push({
                code: "partner/1",
                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3"
            });
        } else if (roll < 0.75) {
            badges.push({
                code: "twitch-dj/1",
                url: "https://static-cdn.jtvnw.net/badges/v1/cf91bbc0-0332-413a-a7f3-e36bac08b624/3"
            });
        }
    }

    if (plt === "youtube" && randBoolean()) {
        authorType = "MODERATOR";
        badges.push(YOUTUBE_MODERATOR_BADGE);
    }

    if (plt === "youtube") {
        const roll = randFloat({ min: 0, max: 1 });

        if (roll < 0.5) {
            badges.push({
                code: "verified",
                url: "/assets/youtube/YouTubeVerified.png"
            });
        } else if (roll < 0.75) {
            badges.push({
                code: "verified-artist",
                url: "/assets/youtube/YouTubeArtist.png"
            });
        }
    }

    return [badges, authorType];
}
