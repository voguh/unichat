import React from "react";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { invoke } from "@tauri-apps/api/core";

import { DashboardHome } from "./DashboardHome";
import { DashboardStyledContainer } from "./styled";

const TABS = {
    youtube: { icon: "fab fa-youtube fa-xl" }
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
            <Paper className="sidebar">
                {Object.entries(TABS).map(([id, { icon }]) => {
                    return (
                        <Button key={id} size="small" onClick={() => toggleWebview(id)}>
                            <i className={icon} />
                        </Button>
                    );
                })}
            </Paper>
            <div className="content">
                <DashboardHome />
            </div>
        </DashboardStyledContainer>
    );
}
