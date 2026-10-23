/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export function chooseByPlatform<T>(isTwitch: boolean, isYouTube: boolean, twitch: T, youtube: T, other: T): T {
    if (isTwitch) {
        return twitch;
    } else if (isYouTube) {
        return youtube;
    }

    return other;
}
