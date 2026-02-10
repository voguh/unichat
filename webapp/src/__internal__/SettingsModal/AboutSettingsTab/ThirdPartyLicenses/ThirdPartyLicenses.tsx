/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";
import Badge from "react-bootstrap/Badge";
import Table from "react-bootstrap/Table";

import { commandService } from "unichat/services/commandService";
import { ThirdPartyLicenseInfo } from "unichat/types";

import { ThirdPartyLicensesStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function ThirdPartyLicenses(_props: Props): React.ReactNode {
    const [thirdPartyLicenses, setThirdPartyLicenses] = React.useState<ThirdPartyLicenseInfo[]>([]);

    function formatLicenses(expr: string): string[] {
        const ids = expr
            .replace(/[()]/g, " ")
            .split(/\s+/)
            .filter((t) => t !== "AND" && t !== "OR" && t !== "WITH")
            .flatMap((t) => t.split("/"))
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        return Array.from(new Set(ids)).sort();
    }

    React.useEffect(() => {
        commandService.getThirdPartyLicenses().then(setThirdPartyLicenses);
    }, []);

    return (
        <ThirdPartyLicensesStyledContainer>
            <Table>
                <thead>
                    <tr>
                        <th>Package</th>
                        <th>License(s)</th>
                    </tr>
                </thead>
                <tbody>
                    {thirdPartyLicenses
                        .sort((a, b) => `${a.source}:${a.name}`.localeCompare(`${b.source}:${b.name}`))
                        .map((pkg) => (
                            <tr key={pkg.name} className={clsx({ withLink: !!pkg.repository })}>
                                <td onClick={() => pkg.repository && openUrl(pkg.repository)}>
                                    <span>
                                        <Badge bg="default" data-source={pkg.source}>
                                            {pkg.source}
                                        </Badge>
                                        {pkg.name} v{pkg.version}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {formatLicenses(pkg.licenses).map((l) => (
                                            <Badge
                                                key={l}
                                                bg="success"
                                                onClick={() => openUrl(`https://opensource.org/license/${l}`)}
                                            >
                                                {l}
                                            </Badge>
                                        ))}
                                    </span>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </ThirdPartyLicensesStyledContainer>
    );
}
