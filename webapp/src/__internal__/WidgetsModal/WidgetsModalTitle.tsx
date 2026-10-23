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

import { IconButton } from "@voguh/unichat-ui/components/ui/Button";
import { useModalContext } from "unichat/hooks/useModalContext";

import styles from "./styles.module.css";
import type { WidgetsModalSharedStore } from "./WidgetsModal";

export function WidgetsModalTitle(): PReact.ComponentChildren {
    const { sharedStore, setSharedStore } = useModalContext<WidgetsModalSharedStore>();

    if (sharedStore.selectedWidget == null) {
        return "Widgets";
    }

    return (
        <span className={styles.title}>
            <IconButton aria-label="Back" onClick={() => setSharedStore((old) => ({ ...old, selectedWidget: null }))}>
                <i className="fas fa-arrow-left" />
            </IconButton>
            Widgets / {sharedStore.selectedWidget.name}
        </span>
    );
}
