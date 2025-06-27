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

export enum IPCYoutubeEvents {
    YOUTUBE_EVENT = "unichat://youtube:event"
}

export const YOUTUBE_EVENT_DESCRIPTION: Record<IPCYouTubeStatusEvent["type"], string> = {
    idle: "The YouTube chat scrapper is idle.",
    ready: "The YouTube chat scrapper is ready to use.",
    ping: "The YouTube chat scrapper is working.",
    error: "The YouTube chat scrapper is not responding or has encountered an error."
};

export interface IPCYouTubeStatusIdleEvent {
    type: "idle";
    timestamp: number;
}

export interface IPCYouTubeStatusReadyEvent {
    type: "ready";
    url: string;
    clientId: string;
    timestamp: number;
}

export interface IPCYouTubeStatusPingEvent {
    type: "ping";
    timestamp: number;
}

export interface IPCYouTubeStatusErrorEvent {
    type: "error";
    error: string;
    timestamp: number;
}

export type IPCYouTubeStatusEvent =
    | IPCYouTubeStatusIdleEvent
    | IPCYouTubeStatusReadyEvent
    | IPCYouTubeStatusPingEvent
    | IPCYouTubeStatusErrorEvent;
