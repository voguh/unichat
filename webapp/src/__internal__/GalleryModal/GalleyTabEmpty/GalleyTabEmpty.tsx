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
import { galleryItemStyle } from "unichat/__internal__/GalleryModal/GalleryItemDisplay";

import styles from "./styles.module.css";

interface Props {
    withSelect: boolean;
}

export function GalleyTabEmpty({ withSelect }: Props): PReact.ComponentChildren {
    return (
        <div className={styles.root}>
            <div className={clsx(galleryItemStyle, "sizer")} aria-hidden="true">
                <div className="name">&nbsp;</div>
                <div className="preview" />
                {withSelect && (
                    <div className="footer">
                        <Button>&nbsp;</Button>
                    </div>
                )}
            </div>
            <EmptyState icon={<i className="fas fa-images" />} title="No items to display" />
        </div>
    );
}
