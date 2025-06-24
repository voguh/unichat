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

import { Button } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { AppContext } from "unichat/contexts/AppContext";

import { AboutModalStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function AboutModal(_props: Props): React.ReactNode {
    const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
    const [url, setUrl] = React.useState<string>("");

    const { metadata } = React.useContext(AppContext);

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
        <AboutModalStyledContainer>
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
                <Button variant="default" onClick={() => openUrl(metadata.licenseUrl)}>
                    License
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
        </AboutModalStyledContainer>
    );
}
