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

import { Clipboard } from "@voguh/unichat-ui/Clipboard";
import { Select } from "@voguh/unichat-ui/forms/Select";
import { QrCode } from "@voguh/unichat-ui/QrCode";
import type { SelectOption } from "@voguh/unichat-ui/Select";
import { commandService } from "unichat/services/commandService";

import styles from "./styles.module.css";

interface Props {
    baseUrl: string;
}

function formatHost(host: string): string {
    if (host.includes(":")) {
        return `[${host}]`;
    }

    return host;
}

export function QRCodeModal({ baseUrl }: Props): PReact.ComponentChildren {
    const [systemHosts, setSystemHosts] = useState<SelectOption[]>([]);
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
            setSystemHosts(systemHosts.map(formatHost).map((host) => ({ label: host, value: host })));

            if (systemHosts.length > 0) {
                onSelectHost(systemHosts[0]);
            }
        }

        init();
    }, []);

    if (!systemHosts || systemHosts.length === 0) {
        return (
            <div className={styles.root}>
                <div className="label">No available network interfaces found to generate QR code.</div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            {systemHosts.length > 1 && (
                <Select
                    label="Select Network Interface"
                    options={systemHosts}
                    value={selectedHost}
                    onChange={(event) => onSelectHost(event.currentTarget.value)}
                />
            )}
            {selectedHostQrCodeUrl && (
                <>
                    <div className="label">Scan this QR code with your device to open</div>
                    <QrCode value={selectedHostQrCodeUrl} alt="QR Code" />
                    <Clipboard value={selectedHostQrCodeUrl} />
                </>
            )}
        </div>
    );
}
