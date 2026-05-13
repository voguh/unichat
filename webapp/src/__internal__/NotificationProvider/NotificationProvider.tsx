/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { Toast } from "unichat/components/Toast";
import { eventEmitter } from "unichat/services/eventEmitter";
import { NotificationOptions } from "unichat/services/notificationService";

import { NotificationProviderStyledContainer, Position } from "./styled";

interface RichNotification extends NotificationOptions {
    id: string;
}

interface Props {
    limit?: number;
    position?: Position;
}

export function NotificationProvider({ limit = 3, position = "bottom-center" }: Props): PReact.ComponentChildren {
    const [showing, setShowing] = useState<RichNotification[]>([]);

    const queueRef = useRef<RichNotification[]>([]);

    function processQueue(): void {
        setShowing((prevShowing) => {
            const showingSize = prevShowing.length;
            if (showingSize >= limit) {
                return prevShowing;
            }

            const queueSize = queueRef.current.length;
            if (queueSize === 0) {
                return prevShowing;
            }

            const shiftCount = Math.min(queueSize, limit - showingSize);
            const toPush = queueRef.current.splice(0, shiftCount);

            return [...prevShowing, ...toPush];
        });
    }

    function onHide(id: string): void {
        setShowing((prevShowing) => prevShowing.filter((notification) => notification.id !== id));
        requestAnimationFrame(processQueue);
    }

    function handleNotification(notification: NotificationOptions): void {
        queueRef.current.push({ ...notification, id: crypto.randomUUID() });
        requestAnimationFrame(processQueue);
    }

    useEffect(() => {
        eventEmitter.on("notification:show", handleNotification);

        return () => {
            eventEmitter.off("notification:show", handleNotification);
        };
    }, []);

    return (
        <NotificationProviderStyledContainer position={position}>
            {showing.map((notification) => (
                <Toast
                    key={notification.id}
                    type={notification.type}
                    icon={notification.icon}
                    title={notification.title}
                    onClose={() => onHide(notification.id)}
                >
                    {notification.message}
                </Toast>
            ))}
        </NotificationProviderStyledContainer>
    );
}
