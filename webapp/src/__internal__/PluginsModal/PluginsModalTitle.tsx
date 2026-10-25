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

import { IconButton } from "@voguh/unichat-ui/Button";
import { useModalContext } from "unichat/hooks/useModalContext";

import type { PluginsModalSharedStore } from "./PluginsModal";
import styles from "./styles.module.css";

export function PluginsModalTitle(): PReact.ComponentChildren {
    const { sharedStore, setSharedStore } = useModalContext<PluginsModalSharedStore>();

    if (sharedStore.selectedPlugin == null) {
        return "Plugins";
    }

    return (
        <span className={styles.title}>
            <IconButton aria-label="Back" onClick={() => setSharedStore((old) => ({ ...old, selectedPlugin: null }))}>
                <i className="fas fa-arrow-left" />
            </IconButton>
            Plugins / {sharedStore.selectedPlugin.name}
        </span>
    );
}
