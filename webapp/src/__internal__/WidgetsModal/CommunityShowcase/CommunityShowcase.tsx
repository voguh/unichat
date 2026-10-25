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
import { useState } from "preact/hooks";

import { Button } from "@voguh/unichat-ui/Button";
import { EmptyState } from "@voguh/unichat-ui/EmptyState";
import { Input } from "@voguh/unichat-ui/Input";
import { SegmentedControl } from "@voguh/unichat-ui/SegmentedControl";
import { CommunityWidgetBadge } from "unichat/__internal__/WidgetsModal/CommunityWidgetBadge";
import { getWidgetStatus, WidgetStatus } from "unichat/__internal__/WidgetsModal/utils/getWidgetStatus";
import type { CommunityWidget } from "unichat/types/addons";

import styles from "./styles.module.css";

enum ShowcaseFilter {
    ALL = "ALL",
    INSTALLED = "INSTALLED",
    UPDATES = "UPDATES"
}

interface Props {
    widgets: CommunityWidget[];
    installing: string | null;
    onSelect: (widget: CommunityWidget) => void;
    onInstall: (widget: CommunityWidget) => void;
    onOpenFolder: (widget: CommunityWidget) => void;
}

export function CommunityShowcase({
    widgets,
    installing,
    onSelect,
    onInstall,
    onOpenFolder
}: Props): PReact.ComponentChildren {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState(ShowcaseFilter.ALL);

    const updatesCount = widgets.filter((widget) => widget.hasUpdate).length;
    const filteredWidgets = widgets.filter((widget) => {
        if (!widget.name.toLowerCase().includes(search.trim().toLowerCase())) {
            return false;
        } else if (filter === ShowcaseFilter.INSTALLED) {
            return widget.installedVersion != null;
        } else if (filter === ShowcaseFilter.UPDATES) {
            return widget.hasUpdate;
        }

        return true;
    });

    function renderAction(widget: CommunityWidget): PReact.ComponentChildren {
        const loading = installing === widget.id;

        switch (getWidgetStatus(widget)) {
            case WidgetStatus.INCOMPATIBLE:
                return (
                    <Button size="sm" disabled>
                        Incompatible
                    </Button>
                );
            case WidgetStatus.UPDATE_AVAILABLE:
                return (
                    <Button size="sm" variant="primary" loading={loading} onClick={() => onInstall(widget)}>
                        Update
                    </Button>
                );
            case WidgetStatus.INSTALLED:
                return (
                    <Button size="sm" onClick={() => onOpenFolder(widget)}>
                        Open folder
                    </Button>
                );
            default:
                return (
                    <Button size="sm" variant="primary" loading={loading} onClick={() => onInstall(widget)}>
                        Install
                    </Button>
                );
        }
    }

    return (
        <div className={styles.showcase}>
            <div className={styles.toolbar}>
                <Input
                    rootProps={{ className: styles.search }}
                    type="search"
                    placeholder="Search widgets"
                    aria-label="Search widgets"
                    startSlot={<i className="fas fa-search" />}
                    value={search}
                    onInput={(event) => setSearch(event.currentTarget.value)}
                />
                <SegmentedControl
                    value={filter}
                    onChange={(event) => setFilter(event.currentTarget.value as ShowcaseFilter)}
                    items={[
                        { value: ShowcaseFilter.ALL, label: "All" },
                        { value: ShowcaseFilter.INSTALLED, label: "Installed" },
                        { value: ShowcaseFilter.UPDATES, label: `Updates (${updatesCount})` }
                    ]}
                />
            </div>

            <div className={styles.content}>
                {filteredWidgets.length === 0 ? (
                    <EmptyState icon={<i className="fas fa-puzzle-piece" />} title="No widgets found" />
                ) : (
                    <div className={styles.grid}>
                        {filteredWidgets.map((widget) => (
                            <div key={widget.id} className={styles.poster}>
                                <button
                                    type="button"
                                    className={styles.posterOpen}
                                    aria-label={`Open ${widget.name}`}
                                    onClick={() => onSelect(widget)}
                                >
                                    <img src={widget.previewUrl} loading="lazy" />
                                </button>
                                <CommunityWidgetBadge className={styles.posterBadge} widget={widget} />
                                <div className={styles.posterInfo}>
                                    <div className={styles.posterTitle}>
                                        <strong>{widget.name}</strong>
                                        <small>v{widget.version}</small>
                                    </div>
                                    {renderAction(widget)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
