/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import encodeQR from "qr";

import { Option, Select } from "unichat/components/forms/Select";
import { TextInput } from "unichat/components/forms/TextInput";
import { commandService } from "unichat/services/commandService";

import { QRCodeModalStyledContainer } from "./styled";

interface Props {
    baseUrl: string;
}

export function QRCodeModal({ baseUrl }: Props): PReact.ComponentChildren {
    const [systemHosts, setSystemHosts] = useState<Option[]>([]);
    const [selectedHost, setSelectedHost] = useState<Option | null>(null);
    const [selectedHostQrCodeUrl, setSelectedHostQrCodeUrl] = useState<string | null>(null);

    function onSelectHost(option: Option | null): void {
        if (option == null) {
            return;
        }

        setSelectedHost(option);

        const normalizedIp = option.value.includes(":") ? `[${option.value}]` : option.value; // Handle IPv6 addresses
        const hostUrl = baseUrl.replace("localhost", normalizedIp);
        setSelectedHostQrCodeUrl(hostUrl);
    }

    useEffect(() => {
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
            {selectedHostQrCodeUrl && (
                <>
                    <div className="qrcode-label">Scan this QR code with your device to open</div>
                    <div
                        className="qrcode"
                        dangerouslySetInnerHTML={{ __html: encodeQR(selectedHostQrCodeUrl, "svg") }}
                    />
                    <TextInput value={selectedHostQrCodeUrl} readonly onClick={(e) => e.currentTarget.select()} />
                </>
            )}
        </QRCodeModalStyledContainer>
    );
}
