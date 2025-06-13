import React from "react";

import { Button, Card } from "@mantine/core";
import { IconLayoutDashboardFilled } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";

import { DashboardHome } from "./DashboardHome";
import { DashboardStyledContainer } from "./styled";

const TABS = {
    youtube: { icon: IconLayoutDashboardFilled }
};

interface Props {
    children?: React.ReactNode;
}

export function Dashboard(_props: Props): React.ReactNode {
    async function toggleWebview(id: string): Promise<void> {
        invoke("toggle_webview", { label: `${id}-chat` });
    }

    return (
        <DashboardStyledContainer>
            <Card className="sidebar" withBorder shadow="xs">
                {Object.entries(TABS).map(([id, { icon: Icon }]) => {
                    return (
                        <Button key={id} onClick={() => toggleWebview(id)}>
                            <Icon size="20" />
                        </Button>
                    );
                })}
            </Card>
            <div className="content">
                <DashboardHome />
            </div>
        </DashboardStyledContainer>
    );
}
