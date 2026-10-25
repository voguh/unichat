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

import { Button } from "@voguh/unichat-ui/Button";
import { EmptyState } from "@voguh/unichat-ui/EmptyState";
import { CommunityAddonBadge } from "unichat/__internal__/CommunityAddons/CommunityAddonBadge";
import { CommunityAddonsToolbar } from "unichat/__internal__/CommunityAddons/CommunityAddonsToolbar";
import { useCommunityAddonsFilter } from "unichat/__internal__/CommunityAddons/hooks/useCommunityAddonsFilter";
import {
    CommunityAddonStatus,
    getCommunityAddonStatus
} from "unichat/__internal__/CommunityAddons/utils/getCommunityAddonStatus";
import type { WidgetCommunityDisplay } from "unichat/__internal__/WidgetsModal/utils/toWidgetDisplays";
import type { SelectedWidget } from "unichat/__internal__/WidgetsModal/WidgetsModal";
import type { CommunityWidget } from "unichat/types/addons";

import styles from "./styles.module.css";

interface Props {
    widgets: WidgetCommunityDisplay[];
    installing: string | null;
    onSelect: (widget: SelectedWidget) => void;
    onInstall: (widget: CommunityWidget) => void;
    onOpenFolder: (id: string) => void;
}

export function CommunityWidgetsShowcase({
    widgets,
    installing,
    onSelect,
    onInstall,
    onOpenFolder
}: Props): PReact.ComponentChildren {
    const filterState = useCommunityAddonsFilter(widgets);

    function renderAction(widget: CommunityWidget): PReact.ComponentChildren {
        const loading = installing === widget.id;

        switch (getCommunityAddonStatus(widget)) {
            case CommunityAddonStatus.INCOMPATIBLE:
                return (
                    <Button size="sm" disabled>
                        Incompatible
                    </Button>
                );
            case CommunityAddonStatus.UPDATE_AVAILABLE:
                return (
                    <Button size="sm" variant="primary" loading={loading} onClick={() => onInstall(widget)}>
                        Update
                    </Button>
                );
            case CommunityAddonStatus.INSTALLED:
                return (
                    <Button size="sm" onClick={() => onOpenFolder(widget.id)}>
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
        <div className={styles.root}>
            <CommunityAddonsToolbar placeholder="Search widgets" state={filterState} />

            <div className="content">
                {filterState.filteredAddons.length === 0 ? (
                    <EmptyState icon={<i className="fas fa-puzzle-piece" />} title="No widgets found" />
                ) : (
                    <div className="posters">
                        {filterState.filteredAddons.map((widget) => (
                            <div key={widget.id}>
                                <button
                                    type="button"
                                    aria-label={`Open ${widget.name}`}
                                    onClick={() => onSelect(widget)}
                                >
                                    <img src={widget.previewUrl} loading="lazy" />
                                </button>
                                <CommunityAddonBadge addon={widget} />
                                <div>
                                    <div>
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
