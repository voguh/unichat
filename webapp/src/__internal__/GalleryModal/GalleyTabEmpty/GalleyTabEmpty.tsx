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

import { Button } from "@voguh/unichat-ui/Button";
import { EmptyState } from "@voguh/unichat-ui/EmptyState";
import { clsx } from "@voguh/unichat-ui/utils/clsx";

import itemStyles from "../GalleryItemDisplay/styles.module.css";
import styles from "./styles.module.css";

interface Props {
    withSelect: boolean;
}

export function GalleyTabEmpty({ withSelect }: Props): PReact.ComponentChildren {
    return (
        <div className={styles.container}>
            <div className={clsx(itemStyles.container, styles.sizer)} aria-hidden="true">
                <div className={itemStyles.name}>&nbsp;</div>
                <div className={itemStyles.preview} />
                {withSelect && (
                    <div className={itemStyles.footer}>
                        <Button>&nbsp;</Button>
                    </div>
                )}
            </div>
            <EmptyState
                className={styles.emptyState}
                icon={<i className="fas fa-images" />}
                title="No items to display"
            />
        </div>
    );
}
