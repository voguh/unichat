/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { CommunityPlugin, CommunityWidget } from "unichat/types/addons";
import type { PluginMetadata } from "unichat/types/plugins";
import type { WidgetMetadata } from "unichat/types/widgets";
import { invoke } from "unichat/utils/invoke";

export class AddonsService {
    public async getLocalPlugins(): Promise<PluginMetadata[]> {
        return invoke("get_plugins");
    }

    public async getCommunityPlugins(): Promise<CommunityPlugin[]> {
        return invoke<CommunityPlugin[]>("get_community_plugins");
    }

    public async getCommunityPlugin(internalId: string): Promise<CommunityPlugin> {
        return invoke<CommunityPlugin>("get_community_plugin", { internalId });
    }

    public async installCommunityPlugin(internalId: string, release: string): Promise<void> {
        await invoke("install_community_plugin", { internalId, release });
    }

    /* ====================================================================== */

    public async getLocalWidgets(): Promise<WidgetMetadata[]> {
        return invoke<WidgetMetadata[]>("get_widgets");
    }

    public async getCommunityWidgets(): Promise<CommunityWidget[]> {
        return invoke<CommunityWidget[]>("get_community_widgets");
    }

    public async getCommunityWidget(internalId: string): Promise<CommunityWidget> {
        return invoke<CommunityWidget>("get_community_widget", { internalId });
    }

    public async installCommunityWidget(internalId: string, release: string): Promise<void> {
        await invoke("install_community_widget", { internalId, release });
    }
}

export const addonsService = new AddonsService();
