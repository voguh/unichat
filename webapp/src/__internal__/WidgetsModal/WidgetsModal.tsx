/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import React from "react";

import { sep } from "@tauri-apps/api/path";
import { openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import Accordion from "react-bootstrap/Accordion";

import { Button } from "unichat/components/Button";
import { useWidgets } from "unichat/hooks/useWidgets";
import { LoggerFactory } from "unichat/logging/LoggerFactory";
import { toWidgetOptionGroup } from "unichat/utils/toWidgetOptionGroup";

import { WidgetsModalStyledContainer } from "./styled";

interface Props {
    children?: React.ReactNode;
}

const _logger = LoggerFactory.getLogger("Plugins");
export function WidgetsModal(_props: Props): React.ReactNode {
    const [widgets, _reloadWidgets] = useWidgets(toWidgetOptionGroup, []);

    return (
        <WidgetsModalStyledContainer>
            <Accordion defaultActiveKey="0">
                {widgets.map((widgetGroup, idx) => (
                    <Accordion.Item key={idx} eventKey={idx.toString()}>
                        <Accordion.Header>{widgetGroup.label}</Accordion.Header>
                        <Accordion.Body>
                            <table>
                                <tbody>
                                    {widgetGroup.options
                                        .sort((a, b) => a.label.localeCompare(b.label))
                                        .map((widget) => (
                                            <tr key={widget.label}>
                                                <td className="widget-name">
                                                    <span>{widget.label}</span>
                                                </td>
                                                <td className="plugin-actions">
                                                    <div>
                                                        {widgetGroup.label === "User Widgets" && (
                                                            <Button
                                                                variant="default"
                                                                onClick={() =>
                                                                    revealItemInDir(
                                                                        `${UNICHAT_WIDGETS_DIR}${sep()}${widget.label}`
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-folder" />
                                                                Reveal in Folder
                                                            </Button>
                                                        )}
                                                        <Button variant="default" onClick={() => openUrl(widget.label)}>
                                                            <i className="fas fa-external-link-alt" />
                                                            Open in Browser
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </WidgetsModalStyledContainer>
    );
}

export function WidgetsModalActions(_props: Props): React.ReactNode {
    return (
        <>
            <Button
                variant="default"
                onClick={() => openUrl("https://voguh.github.io/unichat/#/widgets/getting_started")}
            >
                <i className="fas fa-book" />
                Read the Docs
            </Button>
            <Button variant="outline" onClick={() => revealItemInDir(UNICHAT_WIDGETS_DIR)}>
                <i className="fas fa-folder" />
                Show Widgets Folder
            </Button>
        </>
    );
}
