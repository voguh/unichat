const MAIN_CONTAINER = document.querySelector("#main-container");
const FEED_ITEM_TEMPLATE = document.querySelector("#feed_item").innerHTML;

let timeagoUpdateInterval = null;

function parseTimeago(timestamp) {
    if (typeof timestamp !== "number") {
        timestamp = parseInt(timestamp, 10);
    }

    const now = new Date();
    const secondsAgo = Math.floor((now - timestamp) / 1000);

    const intervals = [
        { label: "y", seconds: 31536000 },
        { label: "mo", seconds: 2592000 },
        { label: "d", seconds: 86400 },
        { label: "h", seconds: 3600 },
        { label: "m", seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(secondsAgo / interval.seconds);

        if (count >= 1) {
            return `${count}${interval.label}`;
        }
    }

    return "now";
}

function parseTierName(platform, tier) {
    if (platform === "twitch" && tier.toLowerCase() !== "prime") {
        return `T${parseInt(tier, 10) / 1000}`;
    }

    return tier || (platform === "twitch" ? "Subscription" : "Membership");
}

function buildMessage(message, emotes) {
    if (message == null || typeof message !== "string" || message.trim().length === 0) {
        return "";
    }

    let safeMessage = (message ?? "").replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    if (!emotes || !Array.isArray(emotes) || emotes.length === 0) {
        return safeMessage;
    }

    const emotesMap = new Map(emotes.map(emote => [emote.code, emote.url]));
    const processedWords = safeMessage.split(' ').map(word => {
        const emoteUrl = emotesMap.get(word);
        return emoteUrl ? `<img src="${emoteUrl}" />` : word;
    });

    return processedWords.join(' ');
}

function wrapMessage(htmlTemplate, messageText, emotes) {
    if (messageText == null || (typeof messageText === "string" && messageText.trim().length === 0)) {
        return htmlTemplate.replace("{show_content}", "no-message");
    }

    htmlTemplate = htmlTemplate.replace("{show_content}", "with-message");
    htmlTemplate = htmlTemplate.replace("{message_text}", buildMessage(messageText, emotes));

    return htmlTemplate;
}

function buildPlatformBadge(platform) {
    if (platform === "twitch") {
        return ['<img width="12px" height="12px" src="https://assets.twitch.tv/assets/favicon-32-e29e246c157142c94346.png" />', '#f8f9fa'];
    } else if (platform === "youtube") {
        return ['<img width="12px" height="12px" src="https://www.youtube.com/s/desktop/9123e71c/img/favicon_32x32.png" />', '#f8f9fa'];
    }

    return ['UNKNOWN', '#6c757d'];
}

function buildBadges(data, ...badges) {
    badges.unshift(buildPlatformBadge(data.platform));

    let badgesHtml = "";

    for (const [text, bgColor, fgColor] of badges) {
        if (text == null || (typeof text === "string" && text.trim().length === 0)) {
            continue;
        }

        const badgeHtml = `<div class="badge" style="background:${bgColor}; color:${fgColor || '#f8f9fa'};">${text}</div>`;
        badgesHtml += badgeHtml;
    }

    return badgesHtml;
}

/* ============================================================================================== */

function updateEntriesTimeAgo() {
    const entries = MAIN_CONTAINER.querySelectorAll(".timestamp-ago");

    for (const entry of entries) {
        const timestamp = entry.getAttribute("data-timestamp");

        if (timestamp != null) {
            const timeagoText = parseTimeago(timestamp);
            entry.textContent = timeagoText;
        }
    }
}

if (timeagoUpdateInterval == null) {
    timeagoUpdateInterval = setInterval(() => {
        requestAnimationFrame(updateEntriesTimeAgo);
    }, 60000);
}

// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", function () {
    // This listener doesn't receive any data, actually it just notifies
    // that connection is established or re-established.
});

window.addEventListener("unichat:event", function ({ detail: event }) {
    let htmlTemplate = null;
    event.data.timestamp = parseInt(event.data.timestamp, 10) > 1e11 ? parseInt(event.data.timestamp, 10) : parseInt(event.data.timestamp, 10) * 1000;

    if (event.type === "unichat:donate") {
        /** @type {import("../unichat").UniChatEventDonate['data']} */
        const data = event.data;

        htmlTemplate = FEED_ITEM_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        if (data.platform === "youtube") {
            htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [`${data.currency}${data.value}`, "#0ca678"], ["Super chat", "#0ca67880"]));
        } else {
            htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [`${data.value}x`, "#0ca678"], ["Bits", "#0ca67880"]));
        }
        htmlTemplate = htmlTemplate.replace("{details}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{timestmap}", (new Date(data.timestamp)).toLocaleString());
        htmlTemplate = wrapMessage(htmlTemplate, data.messageText, data.emotes);
    } else if (event.type === "unichat:sponsor") {
        /** @type {import("../unichat").UniChatEventSponsor['data']} */
        const data = event.data;

        htmlTemplate = FEED_ITEM_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [`${data.months}mo`, "#f59f00", "#212529"], [parseTierName(data.platform, data.tier), "#f59f0080"]));
        htmlTemplate = htmlTemplate.replace("{details}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{timestmap}", (new Date(data.timestamp)).toLocaleString());
        htmlTemplate = wrapMessage(htmlTemplate, data.messageText, data.emotes);
    } else if (event.type === "unichat:sponsor_gift") {
        /** @type {import("../unichat").UniChatEventSponsorGift['data']} */
        const data = event.data;

        htmlTemplate = FEED_ITEM_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [`${data.count}x`, "#f59f00", "#212529"], [parseTierName(data.platform, data.tier), "#f59f0080"]));
        htmlTemplate = htmlTemplate.replace("{details}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{timestmap}", (new Date(data.timestamp)).toLocaleString());
        htmlTemplate = wrapMessage(htmlTemplate, data.messageText, data.emotes);
    } else if (event.type === "unichat:raid") {
        /** @type {import("../unichat").UniChatEventRaid['data']} */
        const data = event.data;

        htmlTemplate = FEED_ITEM_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        if (data.platform === "youtube") {
            htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, ["RAID", "#7048e8"]));
        } else {
            htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [data.viewerCount, "#7048e8"], ["Raiders", "#7048e880"]));
        }
        htmlTemplate = htmlTemplate.replace("{details}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{timestmap}", (new Date(data.timestamp)).toLocaleString());
        htmlTemplate = wrapMessage(htmlTemplate, data.messageText, data.emotes);
    } else if (event.type === "unichat:redemption") {
        /** @type {import("../unichat").UniChatEventRedemption['data']} */
        const data = event.data;

        htmlTemplate = FEED_ITEM_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data, [data.rewardTitle, "#4263eb"]));
        htmlTemplate = htmlTemplate.replace("{details}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{timestmap}", (new Date(data.timestamp)).toLocaleString());
        htmlTemplate = wrapMessage(htmlTemplate, data.messageText, data.emotes);
    }

    if (htmlTemplate != null && MAIN_CONTAINER.querySelector(`div[data-id="${event.data.messageId}"]`) == null) {
        if (htmlTemplate.includes("{timestmap}")) {
            const timestamp = (new Date(event.data.timestamp)).toLocaleString();
            htmlTemplate = htmlTemplate.replace("{timestmap}", timestamp);
        }

        if (htmlTemplate.includes("{raw_timestamp}")) {
            htmlTemplate = htmlTemplate.replace("{raw_timestamp}", event.data.timestamp);
        }

        if (htmlTemplate.includes("{timeago}")) {
            htmlTemplate = htmlTemplate.replace("{timeago}", parseTimeago(event.data.timestamp));
        }

        $(MAIN_CONTAINER).prepend(htmlTemplate);
    }
});
