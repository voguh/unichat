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

import type { UniChatEmote } from "unichat-widgets/unichat";

const nouns = [
    "cat",
    "dog",
    "house",
    "car",
    "tree",
    "river",
    "sun",
    "moon",
    "book",
    "computer",
    "person",
    "friend",
    "city",
    "sea",
    "mountain",
    "flower",
    "food",
    "drink",
    "time",
    "music",
    "bird",
    "fish",
    "star",
    "cloud",
    "road",
    "bridge",
    "garden",
    "park",
    "school",
    "office",
    "phone",
    "table",
    "chair",
    "window",
    "door",
    "light",
    "shadow",
    "dream",
    "idea",
    "story"
];
const verbs = [
    "runs",
    "jumps",
    "eats",
    "drinks",
    "sleeps",
    "reads",
    "writes",
    "walks",
    "sings",
    "dances",
    "plays",
    "works",
    "studies",
    "travels",
    "talks",
    "thinks",
    "feels",
    "sees",
    "hears",
    "touches",
    "loves",
    "hates",
    "likes",
    "dislikes",
    "wants",
    "needs",
    "has",
    "gives",
    "takes",
    "makes"
];
const adjectives = [
    "black",
    "white",
    "big",
    "small",
    "fast",
    "slow",
    "beautiful",
    "ugly",
    "happy",
    "sad",
    "hot",
    "cold",
    "tall",
    "short",
    "strong",
    "weak",
    "new",
    "old",
    "clean",
    "dirty",
    "red",
    "blue",
    "green",
    "yellow",
    "bright",
    "dark",
    "soft",
    "hard",
    "sweet",
    "sour"
];
const adverbs = [
    "quickly",
    "slowly",
    "happily",
    "sadly",
    "well",
    "badly",
    "always",
    "never",
    "here",
    "there",
    "today",
    "yesterday",
    "tomorrow",
    "now",
    "later",
    "before"
];
const pronouns = ["I", "You", "He", "She", "We", "They"];
const connectors = ["and", "but", "or", "because", "so", "although", "while", "if", "then", "yet"];

const availableEmotes: UniChatEmote[] = [];

export async function randomizeMessage(rng: () => number): Promise<[string, UniChatEmote[]]> {
    if (availableEmotes.length === 0) {
        const data = await fetch("https://api.betterttv.net/3/emotes/shared/top?limit=100");
        const json = await data.json();

        for (const { emote } of json) {
            availableEmotes.push({
                id: emote.id,
                code: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/3x.${emote.imageType}`
            });
        }
    }

    const pRng = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

    const pickRandomEmotes = (): UniChatEmote[] => {
        const count = Math.floor(rng() * 4 + 1);
        const selected = [];
        for (let i = 0; i < count; i++) {
            selected.push(pRng(availableEmotes));
        }

        return selected;
    };

    const structures: Array<() => [string, UniChatEmote[]]> = [
        () => {
            const emotes = [];

            return [`${pRng(pronouns)} ${pRng(verbs)} ${pRng(adjectives)} ${pRng(nouns)}.`, emotes];
        },
        () => {
            const emotes = [];

            return [`The ${pRng(adjectives)} ${pRng(nouns)} ${pRng(verbs)} ${pRng(adverbs)}.`, emotes];
        },
        () => {
            const emote = pRng(availableEmotes);

            return [`${pRng(pronouns)} ${pRng(verbs)} ${pRng(nouns)} ${emote.code} .`, [emote]];
        },
        () => {
            const emote = pRng(availableEmotes);

            return [`The ${pRng(adjectives)} ${pRng(nouns)} ${emote.code} ${pRng(verbs)} ${pRng(adverbs)}.`, [emote]];
        },
        () => {
            const emote1 = pRng(availableEmotes);
            const emote2 = pRng(availableEmotes);

            return [
                `${pRng(pronouns)} ${pRng(verbs)} ${pRng(nouns)} ${pRng(connectors)} ${pRng(pronouns)} ${emote1.code} ${pRng(verbs)} ${emote2.code} .`,
                [emote1, emote2]
            ];
        },
        () => {
            const emote = pRng(availableEmotes);

            return [`Do ${pRng(pronouns)} ${pRng(verbs)} ${pRng(nouns)} ${emote.code} ?`, [emote]];
        },
        () => {
            const emote = pRng(availableEmotes);

            return [`Wow, the ${pRng(adjectives)} ${pRng(nouns)} ${emote.code} !`, [emote]];
        },
        () => {
            const emotes = pickRandomEmotes();
            const msg = emotes.map((e) => e.code).join(" ");

            return [msg, emotes];
        },
        () => {
            const emotes = pickRandomEmotes();
            let msg = `${pRng(pronouns)} ${pRng(verbs)} ${pRng(nouns)}`;
            emotes.forEach((e) => (msg += ` ${e.code}`));
            msg += " .";

            return [msg, emotes];
        }
    ];

    const chosenStructure = structures[Math.floor(rng() * structures.length)];

    return chosenStructure();
}
