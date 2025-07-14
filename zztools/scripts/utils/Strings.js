export class Strings {
    static isNullOrEmpty(s) {
        return s == null || s.trim().length === 0;
    }

    static format(message, ...args) {
        if (args.length > 0) {
            for (const arg of args) {
                if (arg instanceof Error) {
                    message = message.replace("{}", arg.message);
                } else if (typeof arg === "object" && "toString" in arg && typeof arg.toString === "function") {
                    message = message.replace("{}", arg.toString());
                } else {
                    message = message.replace("{}", String(arg));
                }
            }
        }

        return message;
    }
}
