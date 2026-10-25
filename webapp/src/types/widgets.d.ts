/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { WidgetSourceType } from "unichat/utils/constants";

export interface WidgetMetadata {
    id: string;
    name: string;
    description: string | null;
    version: string;
    author: string | null;
    license: string | null;
    homepage: string | null;
    dependencies: string[];

    path: string;
    restPath: string;
    widgetSource: WidgetSource;
    warnings: string[];
}

export interface WidgetSource {
    type: WidgetSourceType;
    value?: string;
}
