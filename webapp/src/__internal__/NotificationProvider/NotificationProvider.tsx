/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect } from "preact/hooks";

import { Toaster, type ToastOptions, toaster, type ToastType as UIToastType } from "@voguh/unichat-ui/Toast";
import { eventEmitter } from "unichat/services/eventEmitter";
import type { NotificationOptions, ToastType } from "unichat/services/notificationService";

const TOAST_TYPES: Record<ToastType, UIToastType | undefined> = {
    success: "success",
    info: "info",
    error: "error",
    warn: "warning",
    default: undefined
};

export function NotificationProvider(): PReact.ComponentChildren {
    useEffect(() => {
        function handleNotification({ type, title, message, icon, id, persistent, action }: NotificationOptions): void {
            const options: ToastOptions = { id, type: TOAST_TYPES[type], title, description: message, icon, action };
            if (persistent) {
                options.duration = Number.POSITIVE_INFINITY;
                options.closable = false;
            }

            toaster.create(options);
        }

        eventEmitter.on("notification:show", handleNotification);

        return () => {
            eventEmitter.off("notification:show", handleNotification);
        };
    }, []);

    return <Toaster />;
}
