/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export enum IPCEvents {
    STATUS_EVENT = "unichat://status:event"
}

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
