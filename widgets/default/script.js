const searchQuery = new URLSearchParams(window.location.search);
const USE_PLATFORM_BADGES = !(searchQuery.get("use_platform_badges") === "false");
const IS_IN_OBS_DOCK = window.obsstudio != null || searchQuery.get("obs_dock") === "true";
const MAXIMUM_MESSAGES = parseInt(searchQuery.get("max_messages") ?? "50", 10);
const MAIN_CONTAINER = document.querySelector("#main-container");
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML;
const DONATE_TEMPLATE = document.querySelector("#donate_item").innerHTML;
const SPONSOR_TEMPLATE = document.querySelector("#sponsor_item").innerHTML;
const SPONSOR_GIFT_TEMPLATE = document.querySelector("#sponsor-gift_item").innerHTML;
const RAID_TEMPLATE = document.querySelector("#raid_item").innerHTML;

function buildBadges(badges) {
    let badgeJoin = ''

    for (const badge of badges) {
        badgeJoin+=`\n<img src="${badge.url}" class="badge" />`
    }

    return badgeJoin;
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

function parseTierName(platform, tier) {
    if (platform === "twitch" && tier.toLowerCase() !== "prime") {
        return parseInt(tier, 10) / 1000
    }

    return tier;
}

function removeChildren() {
    if(MAIN_CONTAINER.children.length > MAXIMUM_MESSAGES) {
        MAIN_CONTAINER.firstChild.remove();
        requestAnimationFrame(removeChildren);
    }
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

if (IS_IN_OBS_DOCK) {
    MAIN_CONTAINER.style.maxHeight = "calc(100vh - 32px)";
    MAIN_CONTAINER.style.overflowY = "auto";

    const authorId = randomId();
    const messageId = randomId();
    let htmlTemplate = MESSAGE_TEMPLATE.replace("{author_id}", authorId);
    htmlTemplate = htmlTemplate.replace("{platform}", "unichat");
    htmlTemplate = htmlTemplate.replace("{message_id}", messageId);
    htmlTemplate = htmlTemplate.replace("{badges}", "");
    htmlTemplate = htmlTemplate.replace("{author_display_name}", "UniChat - OBS Integration");
    htmlTemplate = htmlTemplate.replace("{message}", "OBS dock detected, scroll enabled, maximum messages set to " + MAXIMUM_MESSAGES);

    if (MAIN_CONTAINER.querySelector(`div[data-id="${messageId}"]`) == null) {
        $(MAIN_CONTAINER).append(htmlTemplate);
    }
}

// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", function () {
    // This listener doesn't receive any data, acctually it just notifies
    // that connection is established or re-established.
});

window.addEventListener("unichat:event", function ({ detail: event }) {
    const isAtBottom = MAIN_CONTAINER.scrollHeight - MAIN_CONTAINER.scrollTop <= MAIN_CONTAINER.clientHeight + 5;

    if (USE_PLATFORM_BADGES === true && event != null && event.data != null && Array.isArray(event.data.authorBadges)) {
        let imgUrl;
        if (event.data.platform === "youtube") {
            imgUrl = `${window.location.pathname}/assets/platform_badge_youtube.png`;
        } else if (event.data.platform === "twitch") {
            imgUrl = `${window.location.pathname}/assets/platform_badge_twitch.png`;
        }

        if (imgUrl != null) {
            event.data.authorBadges.unshift({ code: "platform", url: imgUrl })
        }
    }

    if (event.type === "unichat:message") {
        const data = event.data
        let htmlTemplate = MESSAGE_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data.authorBadges));
        htmlTemplate = htmlTemplate.replace("{author_display_name}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id="${data.messageId}"]`) == null) {
            $(MAIN_CONTAINER).append(htmlTemplate);
        }
    } else if (event.type === "unichat:donate") {
        const data = event.data
        let htmlTemplate = DONATE_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data.authorBadges));
        htmlTemplate = htmlTemplate.replace("{author_display_name}", data.authorDisplayName);
        if (data.platform === "twitch") {
            htmlTemplate = htmlTemplate.replace("{donate_meta}", `Just cheered <span class="value">${data.value} ${data.currency}</span>!`);
        } else {
            htmlTemplate = htmlTemplate.replace("{donate_meta}", `Just tipped <span class="value">${data.currency} ${data.value}</span>!`);
        }
        htmlTemplate = htmlTemplate.replace("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id="${data.messageId}"]`) == null) {
            $(MAIN_CONTAINER).append(htmlTemplate);
        }
    } else if (event.type === "unichat:sponsor") {
        const data = event.data
        let htmlTemplate = SPONSOR_TEMPLATE.replace("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replace("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replace("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replace("{badges}", buildBadges(data.authorBadges));
        htmlTemplate = htmlTemplate.replace("{author_display_name}", data.authorDisplayName);
        htmlTemplate = htmlTemplate.replace("{tier}", data.tier);
        const msgBegin = data.platform === "youtube" ? "Become a member" : "Become a subscriber";
        const tier = parseTierName(data.platform, data.tier);
        if (data.months != null) {
            const message = `${msgBegin} for <span>${data.months}</span> months<br/>with tier <span>${tier}</span>!`;
            htmlTemplate = htmlTemplate.replace("{sponsor_meta}", message);
        } else {
            const message = `${msgBegin} with tier <span>${tier}</span>!`;
            htmlTemplate = htmlTemplate.replace("{sponsor_meta}", message);
        }
        htmlTemplate = htmlTemplate.replace("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id="${data.messageId}"]`) == null) {
            $(MAIN_CONTAINER).append(htmlTemplate);
        }
    } else if (event.type === "unichat:sponsor_gift") {
        const data = event.data
        let htmlTemplate = SPONSOR_GIFT_TEMPLATE.replaceAll("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replaceAll("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replaceAll("{message_id}", data.messageId);
        let message = `<span>${data.authorDisplayName}</span>, just gifted `;
        if (data.count > 1) {
            message += `<span>${data.count} ${data.platform === "youtube" ? "memberships": "subscriptions"}</span> `;
        } else {
            message += `<span>${data.count} ${data.platform === "youtube" ? "membership": "subscription"}</span> `;
        }
        if (data.tier) {
            const tier = parseTierName(data.platform, data.tier);
            message += `with tier ${tier}`;
        }
        htmlTemplate = htmlTemplate.replaceAll("{message}", `${message.trim()}!`);

        if (MAIN_CONTAINER.querySelector(`div[data-id="${data.messageId}"]`) == null) {
            $(MAIN_CONTAINER).append(htmlTemplate);
        }
    } else if (event.type === "unichat:raid") {
        const data = event.data
        let htmlTemplate = RAID_TEMPLATE.replaceAll("{author_id}", data.authorId);
        htmlTemplate = htmlTemplate.replaceAll("{platform}", data.platform);
        htmlTemplate = htmlTemplate.replaceAll("{message_id}", data.messageId);
        htmlTemplate = htmlTemplate.replaceAll("{message}", `<span>${data.authorDisplayName}</span>&nbsp;is raiding with ${data.viewerCount ?? 'their'} viewers!`);

        $(MAIN_CONTAINER).append(htmlTemplate);
    } else if (event.type === 'unichat:remove_message') {
        MAIN_CONTAINER.querySelector(`div[data-id="${event.data.messageId}"]`)?.remove();
    } else if (event.type === 'unichat:remove_author') {
        const messages = MAIN_CONTAINER.querySelectorAll(`div[data-from="${event.data.authorId}"]`);
        for (const message of (messages ?? [])) {
            message.remove();
        }
    } else if (event.type === 'unichat:clear') {
        MAIN_CONTAINER.innerHTML = '';
    }

    if(isAtBottom && IS_IN_OBS_DOCK) {
        MAIN_CONTAINER.scrollTop = MAIN_CONTAINER.scrollHeight;
    }

    requestAnimationFrame(removeChildren);
});
