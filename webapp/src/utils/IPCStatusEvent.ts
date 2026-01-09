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
    scraperId: string;
    timestamp: number;
}

export interface IPCStatusReadyEvent {
    type: "ready";
    scraperId: string;
    timestamp: number;
}

export interface IPCStatusPingEvent {
    type: "ping";
    scraperId: string;
    timestamp: number;
}

export interface IPCStatusErrorEvent {
    type: "error" | "fatal";
    scraperId: string;
    timestamp: number;

    message: string;
    stack: string;
}

export type IPCStatusEvent = IPCStatusIdleEvent | IPCStatusReadyEvent | IPCStatusPingEvent | IPCStatusErrorEvent;

export interface IPCNotificationEvent {
    title: string;
    message: string;
}
