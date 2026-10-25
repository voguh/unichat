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

import { Badge } from "@voguh/unichat-ui/Badge";
import { getWidgetStatus, WidgetStatus } from "unichat/__internal__/WidgetsModal/utils/getWidgetStatus";
import type { CommunityWidget } from "unichat/types/addons";

interface Props {
    widget: CommunityWidget;
}

export function CommunityWidgetBadge({ widget }: Props): PReact.ComponentChildren {
    switch (getWidgetStatus(widget)) {
        case WidgetStatus.INCOMPATIBLE:
            return <Badge variant="danger">Requires UniChat {widget.requiresUniChat}</Badge>;
        case WidgetStatus.UPDATE_AVAILABLE:
            return (
                <Badge variant="warning">
                    Update {widget.installedVersion} <i className="fas fa-arrow-right" /> {widget.version}
                </Badge>
            );
        case WidgetStatus.INSTALLED:
            return <Badge variant="success">Installed {widget.installedVersion}</Badge>;
        default:
            return null;
    }
}
