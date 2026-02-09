/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import BSToastContainer, { ToastContainerProps } from "react-bootstrap/ToastContainer";

import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { eventEmitter } from "unichat/services/eventEmitter";
import { NotificationOptions } from "unichat/services/notificationService";

import { ToastWrapper } from "./ToastWrapper";

interface RichNotification extends NotificationOptions {
    id: string;
}

interface Props {
    limit?: number;
    position?: ToastContainerProps["position"];
}

const _logger = LoggerFactory.getLogger("ToastContainer");
export function ToastContainer(props: Props): React.ReactNode {
    const { limit = 3, position = "bottom-center" } = props;

    const [showing, setShowing] = React.useState<RichNotification[]>([]);
    const queueRef = React.useRef<RichNotification[]>([]);

    function processQueue(): void {
        const showingSize = showing.length;
        if (showingSize >= limit) {
            return;
        }

        const queueSize = queueRef.current.length;
        if (queueSize === 0) {
            return;
        }

        const shiftCount = Math.min(queueSize, limit - showingSize);
        const toPush = queueRef.current.splice(0, shiftCount);
        setShowing((prevShowing) => [...prevShowing, ...toPush]);
    }

    function onHide(id: string): void {
        setShowing((prevShowing) => prevShowing.filter((notification) => notification.id !== id));
    }

    function handleNotification(notification: NotificationOptions): void {
        queueRef.current.push({ ...notification, id: crypto.randomUUID() });

        requestAnimationFrame(processQueue);
    }

    React.useEffect(() => {
        eventEmitter.on("notification:show", handleNotification);

        return () => {
            eventEmitter.off("notification:show", handleNotification);
        };
    }, []);

    return (
        <BSToastContainer style={{ padding: 16 }} position={position}>
            {showing.map((notification) => (
                <ToastWrapper key={notification.id} {...notification} onClose={() => onHide(notification.id)} />
            ))}
        </BSToastContainer>
    );
}
