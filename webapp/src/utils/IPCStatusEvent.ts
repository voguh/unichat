/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
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
