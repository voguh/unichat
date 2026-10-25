/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useState } from "preact/hooks";

import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@voguh/unichat-ui/Button";
import { modalService } from "unichat/services/modalService";

import styles from "./styles.module.css";
import { ThirdPartyLicenses } from "./ThirdPartyLicenses";

interface Props {
    onClose: () => void;
}

export function AboutSettingsTab(_props: Props): PReact.ComponentChildren {
    const [isCreditsOpen, setIsCreditsOpen] = useState(false);

    function handleOpenThirdPartyLicenses(): void {
        modalService.openModal({
            size: "xl",
            children: <ThirdPartyLicenses />,
            title: "Third Party Licenses"
        });
    }

    return (
        <div className={styles.root}>
            <div className="image">
                <img src={UNICHAT_ICON} />
            </div>
            <div className="name">{UNICHAT_DISPLAY_NAME}</div>
            <div className="version">{UNICHAT_VERSION}</div>
            <div className="homepage">
                <span onClick={() => openUrl(UNICHAT_HOMEPAGE)}>Website</span>
            </div>
            <div className="description">
                This program comes with absolutely no warranty.
                <br />
                See the <span onClick={() => openUrl(UNICHAT_LICENSE_URL)}>{UNICHAT_LICENSE_NAME}</span> license for
                details.
            </div>
            <div className="footer">
                <Button variant="default" onClick={() => setIsCreditsOpen(true)}>
                    Credits
                </Button>
                <Button variant="default" onClick={handleOpenThirdPartyLicenses}>
                    Third Party Licenses
                </Button>
            </div>
            <div className="credits" data-open={isCreditsOpen}>
                <div className="data">
                    <div>
                        <div className="label">Developed by</div>
                        <div className="values">
                            {UNICHAT_AUTHORS.split(";").map((author) => {
                                const [name, _email] = author.split("<");

                                return <p key={author}>{name.trim()}</p>;
                            })}
                        </div>
                    </div>
                </div>
                <div className="footer">
                    <Button variant="default" onClick={() => setIsCreditsOpen(false)}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
