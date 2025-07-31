import readline from "node:readline";

import { Strings } from "./Strings.js";

export function confirm(message, ...args) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    return new Promise((resolve) => {
        rl.question(Strings.format(`${message} ([Y]es/[N]o)\n`, ...args), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}
