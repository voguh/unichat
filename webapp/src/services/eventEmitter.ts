/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import mitt from "mitt";

import { OpenModalOptions } from "./modalService";
import { NotificationOptions } from "./notificationService";

export type EventEmitterEvents = {
    "tour:start": { type: "full" | "whats-new" };
    "notification:show": NotificationOptions;
    "modal:open": OpenModalOptions;
};

export const eventEmitter = mitt<EventEmitterEvents>();
