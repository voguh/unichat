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

export enum IPCEvents {
    STATUS_EVENT = "unichat://status:event"
}

export const EVENT_DESCRIPTION: Record<IPCStatusEvent["type"], string> = {
    idle: "The chat scrapper is idle.",
    ready: "The chat scrapper is ready to use.",
    ping: "The chat scrapper is working.",
    error: "The chat scrapper is not responding or has encountered an error."
};

export interface IPCStatusIdleEvent {
    type: "idle";
    platform: "youtube" | "twitch";
    timestamp: number;
}

export interface IPCStatusReadyEvent {
    type: "ready";
    platform: "youtube" | "twitch";
    url: string;
    clientId: string;
    timestamp: number;
}

export interface IPCStatusPingEvent {
    type: "ping";
    platform: "youtube" | "twitch";
    timestamp: number;
}

export interface IPCStatusErrorEvent {
    type: "error";
    platform: "youtube" | "twitch";
    message: string;
    stack: string;
    timestamp: number;
}

export type IPCStatusEvent = IPCStatusIdleEvent | IPCStatusReadyEvent | IPCStatusPingEvent | IPCStatusErrorEvent;
