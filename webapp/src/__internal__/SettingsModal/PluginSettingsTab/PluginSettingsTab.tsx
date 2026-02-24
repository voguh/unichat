/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { transform } from "sucrase";

import { commandService } from "unichat/services/commandService";
import { userstoreService } from "unichat/services/userstoreService";
import { PluginSettingsTabProps } from "unichat/types/plugins";

type JSXComponent = React.ComponentType<PluginSettingsTabProps>;

interface Props {
    onClose: () => void;
    pluginName: string;
}

function moduleRequire(moduleName: string): any {
    const mod = __MODULES__[moduleName];
    if (mod == null) {
        throw new Error(`Module "${moduleName}" not found`);
    }

    return mod;
}

export function PluginSettingsTab({ onClose, pluginName }: Props): React.ReactNode {
    const [userStore, setUserStore] = React.useState<Record<string, string>>({});
    const [Content, setContent] = React.useState<JSXComponent | null>(null);
    const [loadError, setLoadError] = React.useState<Error | null>(null);

    function onChange(key: string, value: any): void {
        userstoreService.setItem(`${pluginName}:${key}`, value);
    }

    React.useEffect(() => {
        async function load(): Promise<void> {
            try {
                const userStoreItems = await userstoreService.getItems(pluginName);
                const unprefixedItems = Object.entries(userStoreItems).reduce<Record<string, string>>(
                    (acc, [key, value]) => {
                        const unprefixedKey = key.replace(`${pluginName}:`, "");
                        acc[unprefixedKey] = value;
                        return acc;
                    },
                    {}
                );
                setUserStore(unprefixedItems);

                /* ============================================================== */

                const jsxSource = await commandService.getPluginSettingsContent(pluginName);
                if (jsxSource === null) {
                    return;
                }

                const { code } = transform(jsxSource, {
                    transforms: ["jsx", "imports", "typescript"],
                    jsxRuntime: "automatic",
                    production: true
                });

                const module = { exports: {} } as { exports: { default: JSXComponent } };
                const fn = new Function("require", "module", "exports", code);
                fn(moduleRequire, module, module.exports);

                if (module.exports.default) {
                    setContent(() => module.exports.default);
                } else {
                    const firstExport = Object.values(module.exports)[0];
                    if (firstExport) {
                        setContent(() => firstExport);
                    }
                }
            } catch (err) {
                setLoadError(err as Error);
            }
        }

        load();
    }, [pluginName]);

    if (loadError) {
        throw loadError;
    }

    if (Content === null) {
        return null;
    }

    return <Content onClose={onClose} initialValues={Object.freeze({ ...userStore })} onChange={onChange} />;
}
