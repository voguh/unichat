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

import { openUrl } from "@tauri-apps/plugin-opener";
import { generate } from "lean-qr";

import { Button } from "unichat/components/Button";
import { Option, Select } from "unichat/components/forms/Select";
import { TextInput } from "unichat/components/forms/TextInput";
import { Tooltip } from "unichat/components/Tooltip";
import { commandService } from "unichat/services/commandService";

import { QRCodeModalStyledContainer } from "./styled";

interface Props {
    baseUrl: string;
}

export function QRCodeModal({ baseUrl }: Props): PReact.ComponentChildren {
    const [systemHosts, setSystemHosts] = useState<Option[]>([]);
    const [selectedHost, setSelectedHost] = useState<string>("localhost");
    const [selectedHostQrCodeUrl, setSelectedHostQrCodeUrl] = useState<string>(baseUrl);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

    function encodeQR(hostUrl: string): void {
        if (hostUrl == null) {
            return;
        }

        const qrCode = generate(hostUrl);
        const dataUrl = qrCode.toDataURL({ scale: 10, pad: 1 });
        setQrCodeDataUrl(dataUrl);
    }

    function onSelectHost(value: string): void {
        const hostUrl = baseUrl.replace("localhost", value);
        setSelectedHostQrCodeUrl(hostUrl);
        setSelectedHost(value);
        encodeQR(hostUrl);
    }

    useEffect(() => {
        async function init(): Promise<void> {
            const systemHosts = await commandService.getSystemHosts();
            setSystemHosts(
                systemHosts
                    .map((host) => (host.includes(":") ? `[${host}]` : host))
                    .map((host) => ({ label: host, value: host }))
            );

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
                    options={systemHosts}
                    value={selectedHost}
                    onChange={(evt) => onSelectHost(evt.currentTarget.value)}
                />
            )}
            {selectedHostQrCodeUrl && (
                <>
                    <div className="qrcode-label">Scan this QR code with your device to open</div>
                    <div className="qrcode">{qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" />}</div>
                    <div className="qrcode-url">
                        <TextInput value={selectedHostQrCodeUrl} readonly onClick={(e) => e.currentTarget.select()} />
                        <Tooltip placement="left" content="Open in browser">
                            <Button onClick={() => openUrl(selectedHostQrCodeUrl)}>
                                <i className="fas fa-external-link-alt" />
                            </Button>
                        </Tooltip>
                    </div>
                </>
            )}
        </QRCodeModalStyledContainer>
    );
}
