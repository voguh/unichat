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

import { PluginSettingsTabStyledContainer } from "./styled";

interface JSXProps {
    onClose: () => void;
    userStore: Record<string, any>;
    setUerStore: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

type JSXComponent = React.ComponentType<JSXProps>;

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
    const [userStore, setUserStore] = React.useState<Record<string, any>>({});
    const [Content, setContent] = React.useState<JSXComponent | null>(null);

    function wrappedSetUserStore(updater: React.SetStateAction<Record<string, any>>): void {
        if (typeof updater === "function") {
            throw new Error("Functional updates are not supported");
        }

        const updatedItems = Object.entries(updater).reduce(
            (acc, [key, value]) => {
                if (userStore[key] !== value) {
                    acc[`${pluginName}:${key}`] = value;
                }

                return acc;
            },
            {} as Record<string, any>
        );

        userstoreService.setItems(updatedItems);
        setUserStore(updater);
    }

    React.useEffect(() => {
        async function load(): Promise<void> {
            const userStoreItems = await userstoreService.getItems(pluginName);
            const unprefixedItems = Object.entries(userStoreItems).reduce(
                (acc, [key, value]) => {
                    const unprefixedKey = key.replace(`${pluginName}:`, "");
                    acc[unprefixedKey] = value;
                    return acc;
                },
                {} as Record<string, any>
            );
            setUserStore(unprefixedItems);

            /* ============================================================== */

            const jsxSource = await commandService.getPluginSettingsContent(pluginName);
            if (jsxSource === null) {
                return;
            }

            const { code } = transform(jsxSource, {
                transforms: ["jsx", "imports"],
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
        }

        load();
    }, [pluginName]);

    if (Content === null) {
        return null;
    }

    return (
        <PluginSettingsTabStyledContainer>
            <Content onClose={onClose} userStore={userStore} setUerStore={wrappedSetUserStore} />
        </PluginSettingsTabStyledContainer>
    );
}
