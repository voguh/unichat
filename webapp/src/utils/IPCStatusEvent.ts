/*!******************************************************************************
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

export enum ScraperStatus {
    READY = "ready",
    ERROR = "error",
    FATAL = "fatal"
}

export interface IPCStatusEvent {
    type: ScraperStatus;
    scraperId: string;
    timestamp: number;

    message: string | null;
    stack: string | null;
}

export interface IPCNotificationEvent {
    title: string;
    message: string;
}
