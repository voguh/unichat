/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { ComponentChildren } from "preact";

import { eventEmitter } from "./eventEmitter";

export type ToastType = "success" | "info" | "error" | "warn" | "default";

export interface NotificationAction {
    label: string;
    onClick: () => void;
}

export interface NotificationOptions {
    type: ToastType;
    title: string;
    message: string;
    icon?: ComponentChildren;
    id?: string;
    persistent?: boolean;
    action?: NotificationAction;
}

export class NotificationService {
    public show(data: NotificationOptions): void {
        if (data.type == null || !["success", "info", "error", "warn"].includes(data.type)) {
            data.type = "default";
        }

        eventEmitter.emit("notification:show", data);
    }

    public success(data: Omit<NotificationOptions, "type">): void {
        this.show({ ...data, type: "success" });
    }

    public info(data: Omit<NotificationOptions, "type">): void {
        this.show({ ...data, type: "info" });
    }

    public warn(data: Omit<NotificationOptions, "type">): void {
        this.show({ ...data, type: "warn" });
    }

    public error(data: Omit<NotificationOptions, "type">): void {
        this.show({ ...data, type: "error" });
    }
}

export const notificationService = new NotificationService();
