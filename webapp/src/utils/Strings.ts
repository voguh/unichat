export class Strings {
    public static isNullOrEmpty(s: string): boolean {
        return s == null || s.trim().length === 0;
    }

    public static isValidYouTubeChatUrl(s: string): boolean {
        if (this.isNullOrEmpty(s)) {
            return false;
        }

        return /^https:\/\/(www\.)?youtube\.com\/live_chat\?v=(.*)$/.test(s);
    }

    public static isValidTwitchChatUrl(s: string): boolean {
        if (this.isNullOrEmpty(s)) {
            return false;
        }

        return /^https:\/\/(www\.)?twitch\.tv\/popout\/(.*)\/chat$/.test(s);
    }

    public static isValidChatUrl(type: string, s: string): boolean {
        if (type === "youtube") {
            return this.isValidYouTubeChatUrl(s);
        } else if (type === "twitch") {
            return this.isValidTwitchChatUrl(s);
        } else {
            return false;
        }
    }
}
