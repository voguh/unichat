/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
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
        if (this.isNullOrEmpty(s) || !s.startsWith("https://www.youtube.com/live_chat")) {
            return false;
        }

        const params = new URLSearchParams(s.split("?")[1]);
        const videoId = params.get("v");

        return this.isValidYouTubeVideoId(videoId);
    }

    public static isValidTwitchChatUrl(s: string): boolean {
        s = s.split("?")[0];

        if (this.isNullOrEmpty(s) || !s.startsWith("https://www.twitch.tv/popout/") || !s.endsWith("/chat")) {
            return false;
        }

        let username = s.replace("https://www.twitch.tv/popout/", "");
        username = username.split("/")[0];

        return this.isValidTwitchChannelName(username);
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

    public static isValidTwitchChannelName(channelName: string): boolean {
        return /^[0-9A-Za-z_]{4,25}$/i.test(channelName);
    }

    // Thanks to Glenn Slayden which explained the YouTube video ID format
    // on https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video/101153#101153
    public static isValidYouTubeVideoId(videoId: string): boolean {
        return /^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/.test(videoId);
    }
}
