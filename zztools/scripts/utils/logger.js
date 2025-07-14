import { Strings } from "./Strings.js";

export class Logger {
    trace(message, ...args) {
        const formattedMessage = Strings.format(message, ...args);
        console.log(formattedMessage);
    }

    debug(message, ...args) {
        const formattedMessage = Strings.format(message, ...args);
        console.debug(formattedMessage);
    }

    info(message, ...args) {
        const formattedMessage = Strings.format(message, ...args);
        console.info("\x1b[32m\x1b[1minfo:\x1b[0m", formattedMessage);
    }

    warn(message, ...args) {
        const formattedMessage = Strings.format(message, ...args);
        console.warn("\x1b[33m\x1b[1mwarn:\x1b[0m", formattedMessage);
    }

    error(message, ...args) {
        const formattedMessage = Strings.format(message, ...args);
        console.error("\x1b[31m\x1b[1merror:\x1b[0m", formattedMessage);
        if (args.at(-1) instanceof Error) {
            console.error(args.at(-1).stack);
        }
    }

}

export const logger = new Logger();
