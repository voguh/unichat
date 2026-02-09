/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { QRCodeSVG } from "qrcode.react";

import { Option, Select } from "unichat/components/forms/Select";
import { commandService } from "unichat/services/commandService";

import { QRCodeModalStyledContainer } from "./styled";

interface Props {
    baseUrl: string;
}

export function QRCodeModal({ baseUrl }: Props): React.ReactNode {
    const [systemHosts, setSystemHosts] = React.useState<Option[]>([]);
    const [selectedHost, setSelectedHost] = React.useState<Option | null>(null);
    const [selectedHostQrCodeUrl, setSelectedHostQrCodeUrl] = React.useState<string | null>(null);

    function onSelectHost(option: Option | null): void {
        if (option == null) {
            return;
        }

        setSelectedHost(option);

        const hostUrl = baseUrl.replace("localhost", option.value);
        setSelectedHostQrCodeUrl(hostUrl);
    }

    React.useEffect(() => {
        async function init(): Promise<void> {
            const systemHosts = await commandService.getSystemHosts();
            setSystemHosts(systemHosts.map((host) => ({ label: host, value: host })));
            if (systemHosts.length > 0) {
                onSelectHost({ label: systemHosts[0], value: systemHosts[0] });
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
                    options={systemHosts}
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
