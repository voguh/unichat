/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { Badge } from "unichat/components/Badge";
import { commandService } from "unichat/services/commandService";
import { ThirdPartyLicenseInfo } from "unichat/types";

import { ThirdPartyLicensesStyledContainer } from "./styled";

export function ThirdPartyLicenses(): PReact.ComponentChildren {
    const [thirdPartyLicenses, setThirdPartyLicenses] = useState<ThirdPartyLicenseInfo[]>([]);

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

    useEffect(() => {
        commandService.getThirdPartyLicenses().then(setThirdPartyLicenses);
    }, []);

    return (
        <ThirdPartyLicensesStyledContainer>
            <table>
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
                                        <Badge data-source={pkg.source}>{pkg.source}</Badge>
                                        {pkg.name} v{pkg.version}
                                    </span>
                                </td>
                                <td>
                                    <span>
                                        {formatLicenses(pkg.licenses).map((l) => (
                                            <Badge
                                                key={l}
                                                variant="success"
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
            </table>
        </ThirdPartyLicensesStyledContainer>
    );
}
