/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { CommunityWidget, UniChatLocalPlugin, UniChatLocalWidget } from "unichat/types/addons";
import { invoke } from "unichat/utils/invoke";

export class AddonsService {
    public async getLocalPlugins(): Promise<UniChatLocalPlugin[]> {
        return invoke("get_plugins");
    }

    /* ========================================================================================== */

    public async getLocalWidgets(): Promise<UniChatLocalWidget[]> {
        return invoke<UniChatLocalWidget[]>("get_widgets");
    }

    public async getCommunityWidgets(): Promise<CommunityWidget[]> {
        return invoke<CommunityWidget[]>("get_community_widgets");
    }

    public async getCommunityWidget(id: string): Promise<CommunityWidget> {
        return invoke<CommunityWidget>("get_community_widget", { id });
    }

    public async installCommunityWidget(id: string, release: string): Promise<void> {
        await invoke("install_community_widget", { id, release });
    }
}

export const addonsService = new AddonsService();
