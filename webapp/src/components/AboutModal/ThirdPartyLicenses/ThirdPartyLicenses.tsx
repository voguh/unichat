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

import { Badge, Table } from "@mantine/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import clsx from "clsx";

import { AppContext } from "unichat/contexts/AppContext";

import { ThirdPartyLicensesStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

export function ThirdPartyLicenses(_props: Props): React.ReactNode {
    const { metadata } = React.useContext(AppContext);
    console.log(typeof metadata.thirdPartyLicenses);

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
                    {metadata.thirdPartyLicenses
                        .sort((a, b) => `${a.source}:${a.name}`.localeCompare(`${b.source}:${b.name}`))
                        .map((pkg) => (
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
                                    {pkg.licenses
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((l) => (
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
