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

export enum IPCTwitchEvents {
    TWITCH_EVENT = "unichat://twitch:event"
}

export const TWITCH_EVENT_DESCRIPTION: Record<IPCTwitchStatusEvent["type"], string> = {
    idle: "The Twitch chat scrapper is idle.",
    ready: "The Twitch chat scrapper is ready to use.",
    ping: "The Twitch chat scrapper is working.",
    error: "The Twitch chat scrapper is not responding or has encountered an error."
};

export interface IPCTwitchStatusIdleEvent {
    type: "idle";
    timestamp: number;
}

export interface IPCTwitchStatusReadyEvent {
    type: "ready";
    url: string;
    clientId: string;
    timestamp: number;
}

export interface IPCTwitchStatusPingEvent {
    type: "ping";
    timestamp: number;
}

export interface IPCTwitchStatusErrorEvent {
    type: "error";
    message: string;
    stack: string;
    timestamp: number;
}

export type IPCTwitchStatusEvent =
    | IPCTwitchStatusIdleEvent
    | IPCTwitchStatusReadyEvent
    | IPCTwitchStatusPingEvent
    | IPCTwitchStatusErrorEvent;
