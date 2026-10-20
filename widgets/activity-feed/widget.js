const numberFormat = new Intl.NumberFormat("en-US", { minimumIntegerDigits: 2 });
const eventFilters = ["streaks", "sponsor", "sponsor-gift", "donations", "cheers", "raids", "rewards"];
const knownPlatforms = new Set(["youtube", "twitch"]);

const activityList = /** @type {HTMLOListElement} */ (document.getElementById("activity-list"));
const activityTemplate = /** @type {HTMLTemplateElement} */ (document.getElementById("activity-template"));
const activityCount = /** @type {HTMLElement} */ (document.getElementById("activity-count"));
const emptyState = /** @type {HTMLElement} */ (document.getElementById("empty-state"));
const emptyMessage = /** @type {HTMLElement} */ (document.getElementById("empty-message"));
const eventFilterSummary = /** @type {HTMLElement} */ (document.getElementById("event-filter-summary"));
const platformFilterSummary = /** @type {HTMLElement} */ (document.getElementById("platform-filter-summary"));
const platformFilterList = /** @type {HTMLElement} */ (document.getElementById("platform-filter-options"));

/* ========================================================================== */

const activeEventFilters = new Set(eventFilters);
const activePlatforms = new Set(knownPlatforms);
let totalActivities = 0;

/**
 * @param {HTMLElement} container
 * @param {string | null} message
 * @param {import("@voguh/unichat-api/widgets/events").UniChatEmote[]} emotes
 */
function renderMessage(container, message, emotes) {
    if (message == null || message === "") {
        container.setAttribute("hidden", "");
        return;
    }

    const emotesByCode = new Map();
    for (const emote of emotes) {
        emotesByCode.set(emote.code, emote.url);
    }

    for (const part of message.split(/(\s+)/)) {
        const emoteUrl = emotesByCode.get(part);
        if (emoteUrl == null) {
            container.append(document.createTextNode(part));
        } else {
            const image = document.createElement("img");
            image.src = emoteUrl;
            image.alt = part;
            container.append(image);
        }
    }
}

function updateFeedState() {
    const entries = /** @type {NodeListOf<HTMLLIElement>} */ (activityList.querySelectorAll(".activity-entry"));
    let visibleActivities = 0;

    for (const entry of entries) {
        const isVisible =
            activeEventFilters.has(entry.dataset.eventFilter ?? "") && activePlatforms.has(entry.dataset.platform ?? "");
        entry.toggleAttribute("hidden", !isVisible);
        if (isVisible) {
            visibleActivities += 1;
        }
    }

    activityCount.textContent = String(totalActivities).padStart(2, "0");
    emptyState.toggleAttribute("hidden", visibleActivities > 0);
    if (totalActivities > 0 && visibleActivities === 0) {
        emptyMessage.textContent = "No activity in these filters";
    } else {
        emptyMessage.textContent = "Waiting for activity";
    }

    const eventFilterAll = /** @type {HTMLInputElement} */ (document.querySelector("input[data-event-all]"));
    const platformFilterAll = /** @type {HTMLInputElement} */ (document.querySelector("input[data-platform-all]"));
    eventFilterAll.checked = activeEventFilters.size === eventFilters.length;
    platformFilterAll.checked = activePlatforms.size === knownPlatforms.size;
    eventFilterSummary.textContent = eventFilterAll.checked ? "All events" : `${activeEventFilters.size} selected`;
    platformFilterSummary.textContent = platformFilterAll.checked ? "All platforms" : `${activePlatforms.size} selected`;
}

const eventFilterAll = /** @type {HTMLInputElement} */ (document.querySelector("input[data-event-all]"));
eventFilterAll.addEventListener("change", () => {
    const options = /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll("input[data-event-filter]"));
    activeEventFilters.clear();
    for (const option of options) {
        option.checked = eventFilterAll.checked;
        if (option.checked) {
            activeEventFilters.add(option.dataset.eventFilter ?? "");
        }
    }

    updateFeedState();
});

const eventFilterOptions = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll("input[data-event-filter]")
);
for (const option of eventFilterOptions) {
    option.addEventListener("change", () => {
        const filter = option.dataset.eventFilter ?? "";
        if (option.checked) {
            activeEventFilters.add(filter);
        } else {
            activeEventFilters.delete(filter);
        }

        updateFeedState();
    });
}

const platformFilterAll = /** @type {HTMLInputElement} */ (document.querySelector("input[data-platform-all]"));
platformFilterAll.addEventListener("change", () => {
    const options = /** @type {NodeListOf<HTMLInputElement>} */ (
        document.querySelectorAll("input[data-platform-filter]")
    );
    activePlatforms.clear();
    for (const option of options) {
        option.checked = platformFilterAll.checked;
        if (option.checked) {
            activePlatforms.add(option.dataset.platformFilter ?? "");
        }
    }

    updateFeedState();
});

const platformCheckboxes = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll("input[data-platform-filter]")
);
for (const option of platformCheckboxes) {
    option.addEventListener("change", () => {
        const platform = option.dataset.platformFilter ?? "";
        if (option.checked) {
            activePlatforms.add(platform);
        } else {
            activePlatforms.delete(platform);
        }

        updateFeedState();
    });
}

window.addEventListener("unichat:event", ({ detail: event }) => {
    /** @type {{ category: string, kind: string, description: string, author: string, avatar: string | null, platform: string, timestamp: number, message: string | null, emotes: import("@voguh/unichat-api/widgets/events").UniChatEmote[] } | null} */
    let activity = null;

    if (event.type === "unichat:message") {
        const streakDays = event.data.flags["unichat:twitch_streak_days"];
        if (streakDays == null) {
            return null;
        }

        activity = {
            category: "streaks",
            kind: "Streak",
            description: `continued a ${streakDays}-day streak`,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: event.data.messageText,
            emotes: event.data.emotes
        };
    } else if (event.type === "unichat:sponsor") {
        activity = {
            category: "sponsor",
            kind: "Sponsor",
            description:
                event.data.tier == null
                    ? `${event.data.months} months`
                    : `Tier ${event.data.tier} · ${event.data.months} months`,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: event.data.messageText,
            emotes: event.data.emotes
        };
    } else if (event.type === "unichat:sponsor_gift") {
        activity = {
            category: "sponsor-gift",
            kind: "Sponsor gift",
            description: `count: ${event.data.count}`,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: "",
            emotes: []
        };
    } else if (event.type === "unichat:donate") {
        activity = {
            category: "donations",
            kind: "Contribution",
            description: `sent ${event.data.currency}${numberFormat.format(event.data.value)}`,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: event.data.messageText,
            emotes: event.data.emotes
        };
    } else if (event.type === "unichat:cheer") {
        let description = "";
        if (event.data.value != null) {
            description = `${event.data.value}`;
            if (event.data.currency != null) {
                description = `${description} ${event.data.currency}`;
            }
        } else if (event.data.currency != null) {
            description = event.data.currency;
        }

        if (event.data.cheerTitle != null) {
            if (description === "") {
                description = event.data.cheerTitle;
            } else {
                description = `${description} · ${event.data.cheerTitle}`;
            }
        }

        activity = {
            category: "cheers",
            kind: "Cheer",
            description,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: event.data.messageText,
            emotes: event.data.emotes
        };
    } else if (event.type === "unichat:raid") {
        let description = "";
        if (event.data.viewerCount != null) {
            description = `${event.data.viewerCount} viewers`;
        }

        activity = {
            category: "raids",
            kind: "Raid",
            description,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: "",
            emotes: []
        };
    } else if (event.type === "unichat:redemption") {
        activity = {
            category: "rewards",
            kind: "Channel reward",
            description: `redeemed ${event.data.rewardTitle}`,
            author: event.data.authorDisplayName,
            avatar: event.data.authorProfilePictureUrl,
            platform: event.data.platform,
            timestamp: event.data.timestamp,
            message: event.data.messageText,
            emotes: event.data.emotes
        };
    }

    /* ====================================================================== */

    if (activity == null) {
        return;
    }

    if (!knownPlatforms.has(activity.platform)) {
        knownPlatforms.add(activity.platform);
        activePlatforms.add(activity.platform);

        const option = document.createElement("label");
        option.className = "filter-option";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.dataset.platformFilter = activity.platform;
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                activePlatforms.add(activity.platform);
            } else {
                activePlatforms.delete(activity.platform);
            }

            updateFeedState();
        });
        const label = document.createElement("span");
        label.textContent = activity.platform.toUpperCase();
        option.append(checkbox, label);
        platformFilterList.append(option);
    }

    const templateEntry = /** @type {HTMLLIElement} */ (activityTemplate.content.firstElementChild);
    const entry = /** @type {HTMLLIElement} */ (templateEntry.cloneNode(true));
    entry.dataset.eventFilter = activity.category;
    entry.dataset.platform = activity.platform;
    const kind = /** @type {HTMLElement} */ (entry.querySelector(".entry-kind"));
    const platform = /** @type {HTMLElement} */ (entry.querySelector(".entry-platform"));
    const description = /** @type {HTMLElement} */ (entry.querySelector(".entry-description"));
    kind.textContent = activity.kind;
    platform.textContent = activity.platform.toUpperCase();
    description.textContent = `${activity.author} ${activity.description}`;

    const timestamp = new Date(activity.timestamp);
    const time = /** @type {HTMLTimeElement} */ (entry.querySelector(".entry-time"));
    time.dateTime = timestamp.toISOString();
    time.textContent = timestamp.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

    const fallback = /** @type {HTMLElement} */ (entry.querySelector(".entry-avatar-fallback"));
    fallback.textContent = activity.author[0].toUpperCase();

    const avatar = /** @type {HTMLImageElement} */ (entry.querySelector(".entry-avatar-image"));
    if (activity.avatar != null && activity.avatar !== "") {
        avatar.setAttribute("src", activity.avatar);
        avatar.removeAttribute("hidden");
        fallback.setAttribute("hidden", "");
        avatar.addEventListener(
            "error",
            () => {
                avatar.setAttribute("hidden", "");
                fallback.removeAttribute("hidden");
            },
            { once: true }
        );
    }

    let entryMessage = /** @type {HTMLElement} */ (entry.querySelector(".entry-message"));
    renderMessage(entryMessage, activity.message, activity.emotes);
    activityList.prepend(entry);
    totalActivities += 1;
    updateFeedState();
});
