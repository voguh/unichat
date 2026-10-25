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

import { randHex, randUserName } from "@ngneat/falso";
import { emitTo } from "@tauri-apps/api/event";

import type { UniChatAuthorType, UniChatEmote } from "@voguh/unichat-api/widgets/events";
import { Badge } from "@voguh/unichat-ui/Badge";
import { Button } from "@voguh/unichat-ui/Button";
import { NumberInput } from "@voguh/unichat-ui/forms/NumberInput";
import { Select } from "@voguh/unichat-ui/forms/Select";
import { Switch } from "@voguh/unichat-ui/forms/Switch";
import { Textarea } from "@voguh/unichat-ui/forms/Textarea";
import { TextInput } from "@voguh/unichat-ui/forms/TextInput";
import { SegmentedControl } from "@voguh/unichat-ui/SegmentedControl";
import { Tooltip } from "@voguh/unichat-ui/Tooltip";
import { clsx } from "@voguh/unichat-ui/utils/clsx";
import {
    buildCustomEvent,
    CUSTOM_EVENT_LABELS,
    CUSTOM_EVENT_TYPES,
    type CustomEventForm,
    type CustomEventSeed,
    type CustomEventType,
    type CustomPlatform,
    giphyGif,
    lockedAuthorType
} from "unichat/tabs/WidgetEditor/Emulator/__utils__/buildCustomEvent";
import { randomizeMessage } from "unichat/tabs/WidgetEditor/Emulator/__utils__/randomizeMessage";
import { TWITCH_SPONSOR_TIERS } from "unichat/tabs/WidgetEditor/Emulator/__utils__/randomizeSponsorData";

import { PayloadEditor } from "./PayloadEditor";
import styles from "./styles.module.css";

export const CUSTOM_EVENT_EMIT_EVENT = "unichat://emulator:custom_event";

const AUTHOR_TYPES: { value: UniChatAuthorType; label: string }[] = [
    { value: "VIEWER", label: "Viewer" },
    { value: "SPONSOR", label: "Sponsor" },
    { value: "MODERATOR", label: "Moderator" },
    { value: "BROADCASTER", label: "Broadcaster" }
];

const PLATFORMS: { value: CustomPlatform; label: string }[] = [
    { value: "twitch", label: "Twitch" },
    { value: "youtube", label: "YouTube" },
    { value: "other", label: "Other" }
];

const TWITCH_TIERS = TWITCH_SPONSOR_TIERS.map((tier, index) => ({ value: tier, label: `Tier ${index + 1}` }));

function createDefaultForm(): CustomEventForm {
    return {
        platform: "twitch",
        platformId: "",
        type: "unichat:message",

        authorDisplayName: randUserName(),
        authorType: "VIEWER",

        withMessage: true,
        messageMode: "random",
        messageText: "",

        streakDays: "",
        gifUrl: "",

        value: "25",
        currency: "$",
        converted: false,
        originalValue: "135",
        originalCurrency: "R$",
        superSticker: false,

        months: "1",
        tier: TWITCH_SPONSOR_TIERS[0],
        count: "1",
        viewerCount: "10",

        rewardTitle: "Sample Reward",
        rewardCost: "500",
        rewardDescription: "",
        rewardIconUrl: "",

        cheerValue: "100",
        cheerCurrency: "",
        cheerId: "",
        cheerTitle: "Pastel",
        cheerDescription: "",
        cheerIconUrl: "https://www.gstatic.com/youtube/img/pdg/gift/assets/pastel.webp=w320-h320"
    };
}

async function createSeed(previous: CustomEventSeed | null): Promise<CustomEventSeed> {
    const [randomMessageText, randomEmotes] = await randomizeMessage();

    let authorId: string;
    let authorDisplayColor: string;
    if (previous != null) {
        authorId = previous.authorId;
        authorDisplayColor = previous.authorDisplayColor;
    } else {
        authorId = crypto.randomUUID();
        authorDisplayColor = randHex().toUpperCase();
    }

    return {
        authorId: authorId,
        authorDisplayColor: authorDisplayColor,
        messageId: crypto.randomUUID(),
        randomMessageText,
        randomEmotes,
        timestamp: Date.now()
    };
}

function isValidJson(text: string): boolean {
    try {
        JSON.parse(text);

        return true;
    } catch {
        return false;
    }
}

function pickType(types: CustomEventType[], current: CustomEventType): CustomEventType {
    if (types.includes(current)) {
        return current;
    }

    return types[0];
}

function toMessageMode(value: string): CustomEventForm["messageMode"] {
    if (value === "custom") {
        return "custom";
    }

    return "random";
}

function getAuthorTypeLabel(authorType: UniChatAuthorType): string | undefined {
    const option = AUTHOR_TYPES.find((type) => type.value === authorType);
    if (option != null) {
        return option.label;
    }

    return undefined;
}

export function CustomEventEditor(): PReact.ComponentChildren {
    const [form, setForm] = useState<CustomEventForm>(createDefaultForm);
    const [seed, setSeed] = useState<CustomEventSeed | null>(null);
    const [payload, setPayload] = useState("");
    const [editedByHand, setEditedByHand] = useState(false);
    const [authorOpen, setAuthorOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);

    const isTwitch = form.platform === "twitch";
    const isYouTube = form.platform === "youtube";
    const isOther = form.platform === "other";
    const lockedType = lockedAuthorType(form);
    const payloadIsValid = isValidJson(payload);
    const canEmit =
        seed != null && payloadIsValid && form.authorDisplayName !== "" && (!isOther || form.platformId !== "");

    function update(patch: Partial<CustomEventForm>): void {
        setForm((old) => ({ ...old, ...patch }));
    }

    function changePlatform(value: string): void {
        const platform = PLATFORMS.find((item) => item.value === value)!;
        const types = CUSTOM_EVENT_TYPES[platform.value];
        setForm((old) => ({ ...old, platform: platform.value, type: pickType(types, old.type) }));
        setMoreOpen(false);
    }

    function changeType(value: string): void {
        const type = CUSTOM_EVENT_TYPES[form.platform].find((item) => item === value)!;
        update({ type });
        setMoreOpen(false);
    }

    function handlePayloadChange(value: string): void {
        setPayload(value);
        setEditedByHand(true);
    }

    async function handleEmit(): Promise<void> {
        if (editedByHand) {
            await emitTo("main", CUSTOM_EVENT_EMIT_EVENT, JSON.parse(payload));
            return;
        }

        const nextSeed = await createSeed(seed);
        await emitTo("main", CUSTOM_EVENT_EMIT_EVENT, buildCustomEvent(form, nextSeed));
        setSeed(nextSeed);
    }

    function handleReset(): void {
        setForm(createDefaultForm());
        setAuthorOpen(false);
        setMoreOpen(false);
    }

    function messageField(label: string): PReact.ComponentChildren {
        return (
            <div className="wide message">
                <div className="header">
                    <span>{label}</span>
                    <SegmentedControl
                        className={styles.segmented}
                        value={form.messageMode}
                        onChange={(event) => update({ messageMode: toMessageMode(event.currentTarget.value) })}
                        items={[
                            { value: "random", label: "Random" },
                            { value: "custom", label: "Custom" }
                        ]}
                    />
                </div>
                {form.messageMode === "custom" ? (
                    <Textarea
                        aria-label={label}
                        rows={2}
                        value={form.messageText}
                        placeholder="Type the message"
                        onChange={(event) => update({ messageText: event.currentTarget.value })}
                    />
                ) : (
                    <div className="hint">A random message is generated on each emit.</div>
                )}
            </div>
        );
    }

    function optionalMessage(toggleLabel: string, fieldLabel: string): PReact.ComponentChildren {
        return (
            <>
                <Switch
                    groupProps={{ className: "wide" }}
                    label={toggleLabel}
                    checked={form.withMessage}
                    onChange={(event) => update({ withMessage: event.currentTarget.checked })}
                />
                {form.withMessage && messageField(fieldLabel)}
            </>
        );
    }

    function numberField(key: keyof CustomEventForm, label: string, optional = false): PReact.ComponentChildren {
        return (
            <NumberInput
                label={
                    <>
                        {label} {optional && <small>(Optional)</small>}
                    </>
                }
                value={String(form[key])}
                onChange={(event) => update({ [key]: event.currentTarget.value })}
            />
        );
    }

    function textField(
        key: keyof CustomEventForm,
        label: string,
        opts: { optional?: boolean; wide?: boolean } = {}
    ): PReact.ComponentChildren {
        return (
            <TextInput
                groupProps={{ className: clsx({ wide: opts.wide === true }) }}
                label={
                    <>
                        {label} {opts.optional && <small>(Optional)</small>}
                    </>
                }
                value={String(form[key])}
                onChange={(event) => update({ [key]: event.currentTarget.value })}
            />
        );
    }

    function tierField(): PReact.ComponentChildren {
        if (isTwitch) {
            return (
                <Select
                    label="Tier"
                    options={TWITCH_TIERS}
                    value={form.tier}
                    onChange={(event) => update({ tier: event.currentTarget.value })}
                />
            );
        }

        if (isYouTube) {
            return textField("tier", "Membership level", { optional: true });
        }

        return textField("tier", "Tier", { optional: true });
    }

    function buildDetails(): { details: PReact.ComponentChildren; more: PReact.ComponentChildren } {
        switch (form.type) {
            case "unichat:message": {
                let gif: UniChatEmote | null = null;
                if (isTwitch) {
                    gif = giphyGif(form.gifUrl);
                }

                const details =
                    gif != null ? (
                        <div className="wide lock-hint">
                            GIF set: on Twitch a message is either a GIF or text, so the text is ignored.
                        </div>
                    ) : (
                        messageField("Message")
                    );
                const more = isTwitch && (
                    <>
                        {numberField("streakDays", "Watch streak (days)", true)}
                        {textField("gifUrl", "Giphy link", { optional: true, wide: true })}
                    </>
                );

                return { details, more };
            }
            case "unichat:donate": {
                const sticker = isYouTube && form.superSticker;
                const details = (
                    <>
                        {numberField("value", "Value")}
                        {textField("currency", "Currency")}
                        {sticker ? (
                            <div className="wide lock-hint">
                                Super Sticker: YouTube sends the fixed text "sticker" as the message.
                            </div>
                        ) : (
                            optionalMessage("With message", "Message")
                        )}
                    </>
                );
                const more = (
                    <>
                        <Switch
                            groupProps={{ className: "wide" }}
                            label="Converted currency"
                            checked={form.converted}
                            onChange={(event) => update({ converted: event.currentTarget.checked })}
                        />
                        {form.converted && (
                            <>
                                {numberField("originalValue", "Original value")}
                                {textField("originalCurrency", "Original currency")}
                            </>
                        )}
                        {isYouTube && (
                            <Switch
                                groupProps={{ className: "wide" }}
                                label="Super Sticker"
                                checked={form.superSticker}
                                onChange={(event) => update({ superSticker: event.currentTarget.checked })}
                            />
                        )}
                    </>
                );

                return { details, more };
            }
            case "unichat:sponsor":
                return {
                    details: (
                        <>
                            {numberField("months", "Months")}
                            {tierField()}
                            {optionalMessage("With message", "Message")}
                        </>
                    ),
                    more: null
                };
            case "unichat:sponsor_gift":
                return {
                    details: (
                        <>
                            {numberField("count", "Count")}
                            {!isYouTube && tierField()}
                        </>
                    ),
                    more: null
                };
            case "unichat:raid":
                return {
                    details: isYouTube ? (
                        <div className="wide hint">YouTube raids carry no viewer count.</div>
                    ) : (
                        numberField("viewerCount", "Viewers", isOther)
                    ),
                    more: null
                };
            case "unichat:redemption":
                return {
                    details: (
                        <>
                            {textField("rewardTitle", "Reward")}
                            {numberField("rewardCost", "Cost")}
                            {optionalMessage("With user input", "User input")}
                        </>
                    ),
                    more: (
                        <>
                            {textField("rewardDescription", "Prompt", { optional: true, wide: true })}
                            {isOther && textField("rewardIconUrl", "Icon URL", { optional: true, wide: true })}
                        </>
                    )
                };
            case "unichat:cheer":
                if (isTwitch) {
                    return {
                        details: (
                            <>
                                {numberField("cheerValue", "Bits")}
                                {messageField("Message")}
                            </>
                        ),
                        more: null
                    };
                } else if (isYouTube) {
                    return {
                        details: (
                            <>
                                {textField("cheerTitle", "Gift name")}
                                {textField("cheerIconUrl", "Gift image URL")}
                            </>
                        ),
                        more: textField("cheerDescription", "Description", { optional: true, wide: true })
                    };
                }

                return {
                    details: (
                        <>
                            {numberField("cheerValue", "Value", true)}
                            {textField("cheerCurrency", "Currency", { optional: true })}
                            {textField("cheerTitle", "Title", { optional: true })}
                            {textField("cheerIconUrl", "Icon URL", { optional: true })}
                            {optionalMessage("With message", "Message")}
                        </>
                    ),
                    more: (
                        <>
                            {textField("cheerId", "Cheer id", { optional: true })}
                            {textField("cheerDescription", "Description", { optional: true })}
                        </>
                    )
                };
        }
    }

    function getEventGroupProps(): PReact.HTMLAttributes<HTMLDivElement> | undefined {
        if (!isOther) {
            return { className: "wide" };
        }

        return undefined;
    }

    function getAuthorCaption(): string | undefined {
        const label = getAuthorTypeLabel(lockedType ?? form.authorType);
        if (lockedType != null) {
            return `${label} · fixed for this event`;
        }

        return label;
    }

    function getAuthorTypeDescription(): string | undefined {
        if (lockedType != null) {
            return "This platform always sends Viewer here.";
        }

        return undefined;
    }

    function getAuthorToggleLabel(): string {
        if (authorOpen) {
            return "Done";
        }

        return "Edit";
    }

    function getMoreToggleLabel(): string {
        if (moreOpen) {
            return "Hide options";
        }

        return "More options";
    }

    function renderPayloadStatus(): PReact.ComponentChildren {
        if (!payloadIsValid) {
            return <Badge variant="danger">Invalid JSON</Badge>;
        }

        if (editedByHand) {
            return (
                <Tooltip placement="left" content="Emit sends this JSON as is. Changing the form overwrites it.">
                    <Badge variant="warning">Edited by hand</Badge>
                </Tooltip>
            );
        }

        return <Badge variant="secondary">Generated from the form</Badge>;
    }

    useEffect(() => {
        createSeed(null).then(setSeed);
    }, []);

    useEffect(() => {
        if (seed != null) {
            setPayload(JSON.stringify(buildCustomEvent(form, seed), null, 2));
            setEditedByHand(false);
        }
    }, [form, seed]);

    const { details, more } = buildDetails();

    return (
        <div className={styles.root}>
            <div className="form">
                <div className="field">
                    <span>Platform</span>
                    <SegmentedControl
                        className={styles.segmented}
                        value={form.platform}
                        onChange={(event) => changePlatform(event.currentTarget.value)}
                        items={PLATFORMS}
                    />
                </div>

                <div className={styles.grid}>
                    {isOther && textField("platformId", "Platform id")}
                    <Select
                        groupProps={getEventGroupProps()}
                        label="Event"
                        options={CUSTOM_EVENT_TYPES[form.platform].map((type) => ({
                            value: type,
                            label: CUSTOM_EVENT_LABELS[type]
                        }))}
                        value={form.type}
                        onChange={(event) => changeType(event.currentTarget.value)}
                    />
                </div>

                <div className="author">
                    <div className="chip">
                        <span>{form.authorDisplayName.charAt(0).toUpperCase()}</span>
                        <div>
                            <strong>{form.authorDisplayName}</strong>
                            <span>{getAuthorCaption()}</span>
                        </div>
                        <Button size="sm" onClick={() => setAuthorOpen((old) => !old)}>
                            {getAuthorToggleLabel()}
                        </Button>
                    </div>
                    {authorOpen && (
                        <div className={styles.grid}>
                            {textField("authorDisplayName", "Name")}
                            <Select
                                label="Type"
                                description={getAuthorTypeDescription()}
                                disabled={lockedType != null}
                                options={AUTHOR_TYPES}
                                value={lockedType ?? form.authorType}
                                onChange={(event) =>
                                    update({ authorType: event.currentTarget.value as UniChatAuthorType })
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="section-title">Details</div>
                <div className={styles.grid}>{details}</div>

                {more && (
                    <>
                        <button type="button" onClick={() => setMoreOpen((old) => !old)}>
                            {getMoreToggleLabel()}
                        </button>
                        {moreOpen && <div className={clsx(styles.grid, "more")}>{more}</div>}
                    </>
                )}
            </div>

            <div className="payload">
                <div className="header">
                    <span>Payload</span>
                    {renderPayloadStatus()}
                </div>
                <PayloadEditor value={payload} invalid={!payloadIsValid} onChange={handlePayloadChange} />
            </div>

            <div className="footer">
                <Button onClick={handleReset}>Reset</Button>
                <Button variant="primary" disabled={!canEmit} onClick={handleEmit}>
                    Emit
                </Button>
            </div>
        </div>
    );
}
