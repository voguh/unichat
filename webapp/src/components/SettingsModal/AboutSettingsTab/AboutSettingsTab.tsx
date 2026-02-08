/*!******************************************************************************
 * UniChat
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { Button } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { modalService } from "unichat/services/modalService";

import { AboutSettingsTabStyledContainer } from "./styled";
import { ThirdPartyLicenses } from "./ThirdPartyLicenses";

interface Props {
    onClose: () => void;
}

export function AboutSettingsTab(_props: Props): React.ReactNode {
    const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);

    function handleOpenThirdPartyLicenses(): void {
        modalService.openModal({
            size: "xl",
            children: <ThirdPartyLicenses />,
            title: "Third Party Licenses"
        });
    }

    return (
        <AboutSettingsTabStyledContainer>
            <div className="app-image">
                <img src={UNICHAT_ICON} />
            </div>
            <div className="app-name">{UNICHAT_DISPLAY_NAME}</div>
            <div className="app-version">{UNICHAT_VERSION}</div>
            <div className="app-homepage">
                <span onClick={() => openUrl(UNICHAT_HOMEPAGE)}>Website</span>
            </div>
            <div className="app-description">
                This program comes with absolutely no warranty.
                <br />
                See the <span onClick={() => openUrl(UNICHAT_LICENSE_URL)}>{UNICHAT_LICENSE_NAME}</span> license for
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
                            {UNICHAT_AUTHORS.split(";").map((author, index) => {
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
