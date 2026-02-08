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

import { Select } from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";

import { commandService } from "unichat/services/commandService";

import { QRCodeModalStyledContainer } from "./styled";

interface Props {
    baseUrl: string;
}

export function QRCodeModal({ baseUrl }: Props): React.ReactNode {
    const [systemHosts, setSystemHosts] = React.useState<string[]>([]);
    const [selectedHost, setSelectedHost] = React.useState<string>(null);
    const [selectedHostQrCodeUrl, setSelectedHostQrCodeUrl] = React.useState<string>(null);

    function onSelectHost(value: string): void {
        setSelectedHost(value);

        const hostUrl = baseUrl.replace("localhost", value);
        setSelectedHostQrCodeUrl(hostUrl);
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const systemHosts = await commandService.getSystemHosts();
            setSystemHosts(systemHosts);
            if (systemHosts.length > 0) {
                onSelectHost(systemHosts[0]);
            }
        }

        init();
    }, []);

    if (!systemHosts || systemHosts.length === 0) {
        return (
            <QRCodeModalStyledContainer>
                <div className="qrcode-label">No available network interfaces found to generate QR code.</div>
            </QRCodeModalStyledContainer>
        );
    }

    return (
        <QRCodeModalStyledContainer>
            {systemHosts.length > 1 && (
                <Select
                    label="Select Network Interface"
                    data={systemHosts}
                    value={selectedHost}
                    onChange={onSelectHost}
                />
            )}
            <div className="qrcode-label">Scan this QR code with your device to open</div>
            {selectedHostQrCodeUrl && (
                <>
                    <QRCodeSVG value={selectedHostQrCodeUrl} size={200} />
                    <div className="fake-text-input">{selectedHostQrCodeUrl}</div>
                </>
            )}
        </QRCodeModalStyledContainer>
    );
}
