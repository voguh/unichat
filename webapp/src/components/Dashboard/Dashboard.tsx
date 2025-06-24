/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

import React from "react";

import { Button, Card, Menu } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconAdjustments, IconBrandYoutubeFilled, IconInfoCircle } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";

import { AppContext } from "unichat/contexts/AppContext";

import { AboutModal } from "../AboutModal";
import { DashboardHome } from "./DashboardHome";
import { DashboardStyledContainer } from "./styled";

const TABS = {
    youtube: { icon: IconBrandYoutubeFilled }
};

interface Props {
    children?: React.ReactNode;
}

export function Dashboard(_props: Props): React.ReactNode {
    const appContext = React.useContext(AppContext);

    async function toggleWebview(id: string): Promise<void> {
        invoke("toggle_webview", { label: `${id}-chat` });
    }

    async function toggleAboutModal(): Promise<void> {
        modals.open({ title: `About ${appContext.metadata.displayName}`, children: <AboutModal />, centered: true });
    }

    return (
        <DashboardStyledContainer>
            <Card className="sidebar" withBorder shadow="xs">
                <div>
                    {Object.entries(TABS).map(([id, { icon: Icon }]) => {
                        return (
                            <Button key={id} onClick={() => toggleWebview(id)}>
                                <Icon size="20" />
                            </Button>
                        );
                    })}
                </div>

                <Menu position="right">
                    <Menu.Target>
                        <Button variant="default">
                            <IconAdjustments size="20" />
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconInfoCircle size="14" />} onClick={toggleAboutModal}>
                            About
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Card>
            <div className="content">
                <DashboardHome />
            </div>
        </DashboardStyledContainer>
    );
}
