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

import { revealItemInDir } from "@tauri-apps/plugin-opener";

import { Button } from "unichat/components/Button";
import { UniChatPluginMetadata } from "unichat/types";
import { Strings } from "unichat/utils/Strings";

interface Props {
    plugin: UniChatPluginMetadata;
}

export function PluginOverviewModalActions({ plugin: { pluginPath } }: Props): PReact.ComponentChildren {
    return (
        <>
            {Strings.isNullOrEmpty(pluginPath) ? (
                <Button disabled>Built-In Plugin</Button>
            ) : (
                <Button onClick={() => revealItemInDir(pluginPath)}>
                    <i className="fas fa-folder" />
                    &nbsp;Show in Folder
                </Button>
            )}
        </>
    );
}
