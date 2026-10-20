/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { rand, randNumber } from "@ngneat/falso";

import type { UniChatPlatform } from "@voguh/unichat-api/widgets/events";

export const TWITCH_SPONSOR_TIERS = ["1000", "2000", "3000"];
const YOUTUBE_SPONSOR_TIERS = ["Tier 1", "Tier 2", "Tier 3"];

export function randomizeSponsorTier(plt: UniChatPlatform): string {
    return rand(plt === "twitch" ? TWITCH_SPONSOR_TIERS : YOUTUBE_SPONSOR_TIERS);
}

export function randomizeSponsorData(plt: UniChatPlatform): [string, number] {
    return [randomizeSponsorTier(plt), randNumber({ min: 1, max: 12 })];
}
