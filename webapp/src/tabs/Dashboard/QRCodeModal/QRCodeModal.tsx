/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type * as PReact from "preact";
import { useEffect, useState } from "preact/hooks";

import { Select } from "@voguh/unichat-ui/components/forms/Select";
import { Clipboard } from "@voguh/unichat-ui/components/ui/Clipboard";
import { QrCode } from "@voguh/unichat-ui/components/ui/QrCode";
import type { SelectItem } from "@voguh/unichat-ui/components/ui/Select";
import { commandService } from "unichat/services/commandService";

import styles from "./styles.module.css";

interface Props {
    baseUrl: string;
}

export function QRCodeModal({ baseUrl }: Props): PReact.ComponentChildren {
    const [systemHosts, setSystemHosts] = useState<SelectItem[]>([]);
    const [selectedHost, setSelectedHost] = useState<string>("localhost");
    const [selectedHostQrCodeUrl, setSelectedHostQrCodeUrl] = useState<string>(baseUrl);

    function onSelectHost(value: string): void {
        setSelectedHostQrCodeUrl(baseUrl.replace("localhost", value));
        setSelectedHost(value);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: componentDidMount
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
            <div className={styles.container}>
                <div className={styles.label}>No available network interfaces found to generate QR code.</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {systemHosts.length > 1 && (
                <Select
                    label="Select Network Interface"
                    groupProps={{ className: styles.fullWidth }}
                    items={systemHosts}
                    value={[selectedHost]}
                    onValueChange={({ value }) => onSelectHost(value[0])}
                />
            )}
            {selectedHostQrCodeUrl && (
                <>
                    <div className={styles.label}>Scan this QR code with your device to open</div>
                    <QrCode.Root value={selectedHostQrCodeUrl} className={styles.qrcode}>
                        <QrCode.Frame />
                    </QrCode.Root>
                    <Clipboard.Root value={selectedHostQrCodeUrl} className={styles.fullWidth}>
                        <Clipboard.Control>
                            <Clipboard.Input />
                            <Clipboard.Trigger>
                                <Clipboard.Indicator copied>
                                    <i className="fas fa-check" />
                                </Clipboard.Indicator>
                                <Clipboard.Indicator copied={false}>
                                    <i className="fas fa-copy" />
                                </Clipboard.Indicator>
                            </Clipboard.Trigger>
                        </Clipboard.Control>
                    </Clipboard.Root>
                </>
            )}
        </div>
    );
}
