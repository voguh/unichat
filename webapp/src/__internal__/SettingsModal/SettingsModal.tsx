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
import { useContext, useEffect, useState } from "preact/hooks";

import { Button } from "unichat/components/Button";
import { Modal } from "unichat/components/Modal";
import { ModalContext } from "unichat/contexts/ModalContext";

import { AboutSettingsTab } from "./AboutSettingsTab";
import { CheckUpdatesSettingsTab } from "./CheckUpdatesSettingsTab";
import { DevelopersSettingsTab } from "./DevelopersSettingsTab";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { SettingsModalStyledContainer } from "./styled";

/* ========================================================================== */

export interface SelectedItemProps {
    onClose(): void;
}

export interface SettingsItem {
    title: string;
    icon: string;
    children: PReact.ComponentType<SelectedItemProps>;
}

export const settingsItems: Record<string, SettingsItem> = {
    general: {
        title: "General",
        icon: "fas fa-cog",
        children: GeneralSettingsTab
    },
    developers: {
        title: "Developers",
        icon: "fas fa-code",
        children: DevelopersSettingsTab
    },
    "check-updates": {
        title: "Check for Updates",
        icon: "fas fa-download",
        children: CheckUpdatesSettingsTab
    },
    about: {
        title: "About",
        icon: "fas fa-info-circle",
        children: AboutSettingsTab
    }
};
/* ========================================================================== */

interface TabContentProps {
    selectedItem: string;
}

function TabContent({ selectedItem }: TabContentProps): PReact.ComponentChildren {
    const { onClose } = useContext(ModalContext);

    if (!(selectedItem in settingsItems)) {
        throw new Error("Selected item not found in settingsItems");
    }

    const Element = settingsItems[selectedItem].children;

    return <Element onClose={onClose} />;
}

/* ========================================================================== */

interface Props {
    show: boolean;
    onHide(): void;
    externalActiveTab: string | null;
}

export function SettingsModal({ externalActiveTab, onHide, show }: Props): PReact.ComponentChildren {
    const [activeTab, setActiveTab] = useState<keyof typeof settingsItems>("general");

    useEffect(() => {
        if (externalActiveTab != null && externalActiveTab in settingsItems) {
            setActiveTab(externalActiveTab);
        }
    }, [externalActiveTab]);

    return (
        <Modal
            withPortal={false}
            show={show}
            onHide={onHide}
            size="xl"
            title="Settings"
            CustomModalBody={SettingsModalStyledContainer}
        >
            <div className="settings_modal--sidebar">
                <div className="settings_modal--sidebar_items">
                    {Object.entries(settingsItems).map(([key, item]) => (
                        <Button
                            key={key}
                            variant={key === activeTab ? "secondary" : "default"}
                            onClick={() => setActiveTab(key)}
                        >
                            <i className={item.icon} />
                            {item.title}
                        </Button>
                    ))}
                </div>
                <div className="settings_modal--sidebar_footer">
                    <span>
                        <strong>{UNICHAT_DISPLAY_NAME}</strong> {UNICHAT_VERSION}
                    </span>
                </div>
            </div>
            <div className="settings_modal--content">
                <TabContent selectedItem={activeTab} />
            </div>
        </Modal>
    );
}
