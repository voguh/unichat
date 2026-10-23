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

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "@voguh/unichat-ui/components/ui/Button";
import type { UniChatLocalPlugin } from "unichat/types/addons";

interface Props {
    plugin: UniChatLocalPlugin;
}

export function PluginOverviewModalActions({ plugin: { path } }: Props): PReact.ComponentChildren {
    return (
        <Button onClick={() => revealItemInDir(path)}>
            <i className="fas fa-folder" />
            &nbsp;Show in Folder
        </Button>
    );
}
