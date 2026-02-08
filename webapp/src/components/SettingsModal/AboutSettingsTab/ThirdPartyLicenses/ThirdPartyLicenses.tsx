/*!******************************************************************************
 * UniChat
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { Badge, Table } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { ThirdPartyLicensesStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function ThirdPartyLicenses(_props: Props): React.ReactNode {
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

    return (
        <ThirdPartyLicensesStyledContainer>
            <Table stickyHeader>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Package</Table.Th>
                        <Table.Th>License(s)</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {UNICHAT_THIRD_PARTY_LICENSES.sort((a, b) =>
                        `${a.source}:${a.name}`.localeCompare(`${b.source}:${b.name}`)
                    ).map((pkg) => (
                        <Table.Tr key={pkg.name}>
                            <Table.Td>
                                <div
                                    className={clsx({ withLink: !!pkg.repository })}
                                    onClick={() => pkg.repository && openUrl(pkg.repository)}
                                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    <Badge radius="xs" color={pkg.source === "crate" ? "orange" : "blue"}>
                                        {pkg.source}
                                    </Badge>
                                    {pkg.name} v{pkg.version}
                                </div>
                            </Table.Td>
                            <Table.Td style={{ display: "flex", gap: "4px" }}>
                                {formatLicenses(pkg.licenses).map((l) => (
                                    <Badge
                                        key={l}
                                        radius="xs"
                                        color="green"
                                        onClick={() => openUrl(`https://opensource.org/license/${l}`)}
                                    >
                                        {l}
                                    </Badge>
                                ))}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </ThirdPartyLicensesStyledContainer>
    );
}
