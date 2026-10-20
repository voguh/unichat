/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import { rand, randAdjective, randNoun, randNumber, randVerb } from "@ngneat/falso";

import type { UniChatEmote } from "@voguh/unichat-api/widgets/events";

const pronouns = ["I", "You", "He", "She", "We", "They"];
const adverbs = ["quickly", "slowly", "happily", "sadly", "well", "badly", "always", "never", "today", "now", "later"];
const conjunctions = ["and", "but", "or", "because", "so", "although", "while", "if", "then", "yet"];

const availableEmotes: UniChatEmote[] = [];

export async function randomizeMessage(): Promise<[string, UniChatEmote[]]> {
    if (availableEmotes.length === 0) {
        const data = await fetch("https://api.betterttv.net/3/cached/emotes/global");
        const json = await data.json();

        for (const emote of json) {
            availableEmotes.push({
                id: emote.id,
                code: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/3x.${emote.imageType}`
            });
        }
    }

    const pronoun = (): string => rand(pronouns);
    const adverb = (): string => rand(adverbs);
    const conjunction = (): string => rand(conjunctions);
    const noun = (): string => randNoun().toLowerCase();
    const verb = (): string => randVerb().toLowerCase();
    const adjective = (): string => randAdjective().toLowerCase();
    const emote = (): UniChatEmote => rand(availableEmotes);
    const emotesList = (): UniChatEmote[] => Array.from({ length: randNumber({ min: 1, max: 4 }) }, emote);

    const structures: Array<() => [string, UniChatEmote[]]> = [
        () => [`${pronoun()} ${verb()} ${adjective()} ${noun()}.`, []],
        () => [`The ${adjective()} ${noun()} ${verb()} ${adverb()}.`, []],
        () => {
            const e = emote();

            return [`${pronoun()} ${verb()} ${noun()} ${e.code} .`, [e]];
        },
        () => {
            const e = emote();

            return [`The ${adjective()} ${noun()} ${e.code} ${verb()} ${adverb()}.`, [e]];
        },
        () => {
            const e1 = emote();
            const e2 = emote();

            return [
                `${pronoun()} ${verb()} ${noun()} ${conjunction()} ${pronoun()} ${e1.code} ${verb()} ${e2.code} .`,
                [e1, e2]
            ];
        },
        () => {
            const e = emote();

            return [`Do ${pronoun()} ${verb()} ${noun()} ${e.code} ?`, [e]];
        },
        () => {
            const e = emote();

            return [`Wow, the ${adjective()} ${noun()} ${e.code} !`, [e]];
        },
        () => {
            const emotes = emotesList();

            return [emotes.map((e) => e.code).join(" "), emotes];
        },
        () => {
            const emotes = emotesList();

            return [`${pronoun()} ${verb()} ${noun()} ${emotes.map((e) => e.code).join(" ")} .`, emotes];
        }
    ];

    return rand(structures)();
}
