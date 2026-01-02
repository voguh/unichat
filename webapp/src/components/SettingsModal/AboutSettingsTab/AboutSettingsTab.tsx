/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import React from "react";

import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { AppContext } from "unichat/contexts/AppContext";

import { AboutSettingsTabStyledContainer } from "./styled";
import { ThirdPartyLicenses } from "./ThirdPartyLicenses";

interface Props {
    onClose: () => void;
}

export function AboutSettingsTab(_props: Props): React.ReactNode {
    const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
    const [url, setUrl] = React.useState<string>("");

    const { metadata } = React.useContext(AppContext);

    function handleOpenThirdPartyLicenses(): void {
        modals.open({ title: "Third Party Licenses", children: <ThirdPartyLicenses />, size: "xl" });
    }

    React.useEffect(() => {
        const uint8Array = new Uint8Array(metadata.icon);
        const blob = new Blob([uint8Array], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        setUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, []);

    return (
        <AboutSettingsTabStyledContainer>
            <div className="app-image">
                <img src={url} />
            </div>
            <div className="app-name">{metadata.displayName}</div>
            <div className="app-version">{metadata.version}</div>
            <div className="app-homepage">
                <span onClick={() => openUrl(metadata.homepage)}>Website</span>
            </div>
            <div className="app-description">
                This program comes with absolutely no warranty.
                <br />
                See the <span onClick={() => openUrl(metadata.licenseUrl)}>{metadata.licenseName}</span> license for
                details.
            </div>
            <div className="app-footer">
                <Button variant="default" onClick={() => setIsCreditsOpen(true)}>
                    Credits
                </Button>
                <Button variant="default" onClick={handleOpenThirdPartyLicenses}>
                    Third Party Licenses
                </Button>
            </div>
            <div className={clsx("app-credits", { isCreditsOpen })}>
                <div className="credits-data">
                    <div>
                        <div className="label">Developed by</div>
                        <div className="values">
                            {metadata.authors.split(";").map((author, index) => {
                                const [name, _email] = author.split("<");

                                return <p key={index}>{name.trim()}</p>;
                            })}
                        </div>
                    </div>
                </div>
                <div className="credits-footer">
                    <Button variant="default" onClick={() => setIsCreditsOpen(false)}>
                        Close
                    </Button>
                </div>
            </div>
        </AboutSettingsTabStyledContainer>
    );
}
