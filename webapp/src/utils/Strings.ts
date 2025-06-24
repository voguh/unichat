/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

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
