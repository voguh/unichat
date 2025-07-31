/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
