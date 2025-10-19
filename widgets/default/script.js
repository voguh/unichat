const searchQuery = new URLSearchParams(window.location.search);
const USE_PLATFORM_BADGES = !(searchQuery.get("use_platform_badges") === "false");
const IS_IN_OBS_DOCK = searchQuery.get("obs_dock") === "true";
const MAXIMUM_MESSAGES = parseInt(searchQuery.get("max_messages") ?? "50", 10);

const DONATE_TEMPLATE_MESSAGE = `Just {if_platform(youtube,twitch)::tipped::cheered} <span class="value">{value} {currency}</span>!`;
const SPONSOR_TEMPLATE_MESSAGE = `{if_platform(youtube,twitch)::Become a member::Become a subscriber} for <span>{months}</span> months<br/>with tier <span>{tier}</span>!`;
const SPONSOR_GIFT_TEMPLATE_MESSAGE = `<span>{author_display_name}</span>, just gifted <span>{count} {if_platform(youtube,twitch)::memberships::subscriptions}</span> with tier {tier}!`;
const RAID_TEMPLATE_MESSAGE = `<span>{author_display_name}</span>&nbsp;is raiding with {viewer_count} viewers!`;

/* ================================================================================================================== */

const MAIN_CONTAINER = document.querySelector("#main-container");
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML;
const DONATE_TEMPLATE = document.querySelector("#donate_item").innerHTML;
const SPONSOR_TEMPLATE = document.querySelector("#sponsor_item").innerHTML;
const SPONSOR_GIFT_TEMPLATE = document.querySelector("#sponsor-gift_item").innerHTML;
const RAID_TEMPLATE = document.querySelector("#raid_item").innerHTML;

function buildBadges(badges) {
    let badgeJoin = ''

    for (const badge of badges) {
        badgeJoin+=`<img src="${badge.url}" class="badge" />`
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

const platformConditionalRegExp = /\{if_platform\(([^)]+)\)::([^:}]*)::([^:{}]*)\}/g;
function enrichMessage(text, data) {
    let enrichedText = text;

    for (const [rawKey, value] of Object.entries(data)) {
        const key = `{${rawKey}}`;
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (rawKey === "tier") {
            enrichedText = enrichedText.replaceAll(key, parseTierName(data.platform, value));
            enrichedText = enrichedText.replaceAll(snakeKey, parseTierName(data.platform, value));
        } else if (rawKey === "platform") {
            enrichedText = enrichedText.replaceAll(key, value);
            enrichedText = enrichedText.replaceAll(snakeKey, value);
            enrichedText = enrichedText.replace(platformConditionalRegExp, (match, platforms, option1, option2) => {
                const [platform1, platform2] = platforms.split(',').map(p => p.trim());
                console.log(match, platforms, option1, option2);
                if (value === platform1.trim()) {
                    return option1;
                } else if (value === platform2.trim()) {
                    return option2;
                }

                return match;
            });
        } else if (rawKey === "viewerCount") {
            enrichedText = enrichedText.replaceAll(key, value > 1 ? value : 'their');
            enrichedText = enrichedText.replaceAll(snakeKey, value > 1 ? value : 'their');
        } else if (rawKey === "messageText") {
            enrichedText = enrichedText.replaceAll(key, buildMessage(value, data.emotes));
            enrichedText = enrichedText.replaceAll(snakeKey, buildMessage(value, data.emotes));
        } else if (rawKey === "authorBadges") {
            enrichedText = enrichedText.replaceAll(key, buildBadges(value));
            enrichedText = enrichedText.replaceAll(snakeKey, buildBadges(value));
        } else {
            enrichedText = enrichedText.replaceAll(key, value);
            enrichedText = enrichedText.replaceAll(snakeKey, value);
        }
    }

    return enrichedText;
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
    MAIN_CONTAINER.style.overflowY = "auto";

    const authorId = randomId();
    const messageId = randomId();
    let htmlTemplate = MESSAGE_TEMPLATE.replace("{author_id}", authorId);
    htmlTemplate = htmlTemplate.replace("{platform}", "unichat");
    htmlTemplate = htmlTemplate.replace("{message_id}", messageId);
    htmlTemplate = htmlTemplate.replace("{author_badges}", "");
    htmlTemplate = htmlTemplate.replace("{author_display_name}", "UniChat - OBS Integration");
    htmlTemplate = htmlTemplate.replace("{message_text}", "OBS dock enabled! Scroll enabled, maximum messages set to " + MAXIMUM_MESSAGES);

    if (MAIN_CONTAINER.querySelector(`div[data-id="${messageId}"]`) == null) {
        $(MAIN_CONTAINER).append(htmlTemplate);
    }
}

// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", function () {
    // This listener doesn't receive any data, actually it just notifies
    // that connection is established or re-established.
    // const events = [
    //     {"type":"unichat:message","data":{"channelId":"UCwS6U5WcsNOPM53RS7AU0_g","channelName":null,"platform":"youtube","flags":{},"authorId":"UCKqDCcxVhY2a60Ti3mMpIIA","authorUsername":"alverond.schkouwavkz1755","authorDisplayName":"alverond.schkouwavkz1755","authorDisplayColor":"#837C4A","authorProfilePictureUrl":"https://yt4.ggpht.com/Vc-Pyl2kOPlt2yutsweH2hCq9fGGiX33igVKp-BslNjTM6K7dec7-rJI9p2-UeSn2x8Sum3BWg=s64-c-k-c0x00ffffff-no-rj","authorBadges":[{"code":"youtube-leaderboard-first","url":"/assets/youtube/YouTubeLeaderboardFirst.png"}],"authorType":"VIEWER","messageId":"ChwKGkNLbU44S20wcjVBREZVMFVyUVlkaXRBSHFB","messageText":"dei","emotes":[],"timestamp":1760847558617337}},
    //     {"type":"unichat:donate","data":{"channelId":"43887152","channelName":"lullypopch","platform":"twitch","flags":{"unichat:raw:twitch:id":"87ba6bd6-c607-46b1-a913-63921cf87569","unichat:raw:twitch:bits":"100","unichat:raw:twitch:badge-info":"subscriber/2","unichat:raw:twitch:turbo":"0","unichat:raw:twitch:room-id":"43887152","unichat:raw:twitch:returning-chatter":"0","unichat:raw:twitch:color":"#FF0000","unichat:raw:twitch:display-name":"werkrus","unichat:raw:twitch:badges":"subscriber/2,hype-train/1","unichat:raw:twitch:first-msg":"0","unichat:raw:twitch:subscriber":"1","unichat:raw:twitch:tmi-sent-ts":"1760823283705","unichat:raw:twitch:user-id":"42467419","unichat:raw:twitch:mod":"0"},"authorId":"42467419","authorUsername":"werkrus","authorDisplayName":"werkrus","authorDisplayColor":"#FF0000","authorProfilePictureUrl":null,"authorBadges":[{"code":"subscriber/2","url":"https://static-cdn.jtvnw.net/badges/v1/a908d2c4-702f-4906-965d-af5fc4062baa/3"},{"code":"hype-train/1","url":"https://static-cdn.jtvnw.net/badges/v1/fae4086c-3190-44d4-83c8-8ef0cbe1a515/3"}],"authorType":"SPONSOR","value":100.0,"currency":"Bits","messageId":"87ba6bd6-c607-46b1-a913-63921cf87569","messageText":"cheer100","emotes":[],"timestamp":1760823283705}},
    //     {"type":"unichat:sponsor","data":{"channelId":"UCwS6U5WcsNOPM53RS7AU0_g","channelName":null,"platform":"youtube","flags":{},"authorId":"UCzOQr8QSZXE3BhzH3O0eSNg","authorUsername":"lelez_vyserynn","authorDisplayName":"lelez_vyserynn","authorDisplayColor":"#1F0DCE","authorProfilePictureUrl":"https://yt4.ggpht.com/qA0cLtjVY-8rWfzoyY0OQVz87uRQRJETMaQGmOyuTKDg3z-7pKHbzluB7k4Uh61CNsgAKDim=s64-c-k-c0x00ffffff-no-rj","authorBadges":[{"code":"sponsor","url":"/ytimg/N6i1eVWvIGMLvsnPrQ9VklfAMuQkbrxpCZnSln9VnOkvFohg6n2wmSpUg-cYtLPDPtIUE3Y=s32-c-k"}],"authorType":"SPONSOR","tier":"Café Espresso","months":1,"messageId":"ChwKGkNJTzF6TWFxc0pBREZZTER3Z1FkV0k4TUd3","messageText":null,"emotes":[],"timestamp":1760879294228907}},
    //     {"type":"unichat:sponsor_gift","data":{"channelId":"43887152","channelName":"lullypopch","platform":"twitch","flags":{"unichat:raw:twitch:room-id":"43887152","unichat:raw:twitch:badge-info":"subscriber/2","unichat:raw:twitch:msg-param-sub-plan":"1000","unichat:raw:twitch:msg-param-goal-target-contributions":"220","unichat:raw:twitch:user-id":"42467419","unichat:raw:twitch:badges":"subscriber/2,sub-gift-leader/1","unichat:raw:twitch:subscriber":"1","unichat:raw:twitch:msg-param-goal-current-contributions":"293","unichat:raw:twitch:color":"#FF0000","unichat:raw:twitch:msg-param-recipient-display-name":"leandro_batista298","unichat:raw:twitch:msg-id":"subgift","unichat:raw:twitch:msg-param-goal-contribution-type":"SUBS","unichat:raw:twitch:msg-param-recipient-user-name":"leandro_batista298","unichat:raw:twitch:msg-param-sender-count":"111","unichat:raw:twitch:login":"werkrus","unichat:raw:twitch:display-name":"werkrus","unichat:raw:twitch:vip":"0","unichat:raw:twitch:msg-param-origin-id":"7004958623388563898","unichat:raw:twitch:msg-param-months":"2","unichat:raw:twitch:mod":"0","unichat:raw:twitch:tmi-sent-ts":"1760815986851","unichat:raw:twitch:msg-param-goal-user-contributions":"1","unichat:raw:twitch:id":"2a3fbd0c-0490-471f-be01-f18eb51690c2","unichat:raw:twitch:msg-param-recipient-id":"606293284","unichat:raw:twitch:msg-param-gift-months":"3","unichat:raw:twitch:msg-param-sub-plan-name":"Channel Subscription (lullypopch)","unichat:raw:twitch:system-msg":"werkrus gifted 3 months of Tier 1 to leandro_batista298. They've gifted 111 months in the channel!"},"authorId":"42467419","authorUsername":"werkrus","authorDisplayName":"werkrus","authorDisplayColor":"#FF0000","authorProfilePictureUrl":null,"authorBadges":[{"code":"subscriber/2","url":"https://static-cdn.jtvnw.net/badges/v1/a908d2c4-702f-4906-965d-af5fc4062baa/3"},{"code":"sub-gift-leader/1","url":"https://static-cdn.jtvnw.net/badges/v1/21656088-7da2-4467-acd2-55220e1f45ad/3"}],"authorType":"SPONSOR","messageId":"2a3fbd0c-0490-471f-be01-f18eb51690c2","tier":"1000","count":1,"timestamp":1760815986851}},
    //     {"type":"unichat:raid","data":{"channelId":"UCoccXqJaDNlpo7ttPbxj_rw","channelName":null,"platform":"youtube","flags":{},"authorId":null,"authorUsername":null,"authorDisplayName":"Kalo","authorDisplayColor":"#AE6158","authorProfilePictureUrl":"https://yt4.ggpht.com/6ZyVjScClEfIXlYG0A_fpdWo7i2kV04FoRhcrAx1JnDTHLwlXRtCVyLF8u5qTYM0Gy1wFysi=s64-c-k-c0x00ffffff-no-rj","authorBadges":[],"authorType":null,"messageId":"ChwKGkNNNmIzS1hOcnBBREZTNkhyZ1VkS3dNOEFR","viewerCount":null,"timestamp":1760819901}},
    // ]

    // for (const event of events) {
    //     window.dispatchEvent(new CustomEvent("unichat:event", { detail: event }));
    // }
});

window.addEventListener("unichat:event", function ({ detail: event }) {
    const isAtBottom = MAIN_CONTAINER.scrollHeight - MAIN_CONTAINER.scrollTop <= MAIN_CONTAINER.clientHeight + 20;

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

    if (event.type === 'unichat:remove_message') {
        /** @type {import("../unichat").UniChatEventRemoveMessage['data']} */
        const data = event.data;
        MAIN_CONTAINER.querySelector(`div[data-id="${event.data.messageId}"]`)?.remove();
    } else if (event.type === 'unichat:remove_author') {
        /** @type {import("../unichat").UniChatEventRemoveAuthor['data']} */
        const data = event.data;
        const messages = MAIN_CONTAINER.querySelectorAll(`div[data-from="${data.authorId}"]`);
        for (const message of (messages ?? [])) {
            message.remove();
        }
    } else if (event.type === 'unichat:clear') {
        MAIN_CONTAINER.innerHTML = '';
    } else {
        let htmlTemplate;

        if (event.type === "unichat:message") {
            /** @type {import("../unichat").UniChatEventMessage['data']} */
            const data = event.data;

            htmlTemplate = enrichMessage(MESSAGE_TEMPLATE, data);
        } else if (event.type === "unichat:donate") {
            /** @type {import("../unichat").UniChatEventDonate['data']} */
            const data = event.data;

            htmlTemplate = enrichMessage(DONATE_TEMPLATE, data);
            htmlTemplate = htmlTemplate.replace("{donate_meta}", enrichMessage(DONATE_TEMPLATE_MESSAGE, data));
        } else if (event.type === "unichat:sponsor") {
            /** @type {import("../unichat").UniChatEventSponsor['data']} */
            const data = event.data;

            htmlTemplate = enrichMessage(SPONSOR_TEMPLATE, data);
            htmlTemplate = htmlTemplate.replace("{sponsor_meta}", enrichMessage(SPONSOR_TEMPLATE_MESSAGE, data));
        } else if (event.type === "unichat:sponsor_gift") {
            /** @type {import("../unichat").UniChatEventSponsorGift['data']} */
            const data = event.data;

            htmlTemplate = enrichMessage(SPONSOR_GIFT_TEMPLATE, data);
            htmlTemplate = htmlTemplate.replace("{sponsor_gift_meta}", enrichMessage(SPONSOR_GIFT_TEMPLATE_MESSAGE, data));
        } else if (event.type === "unichat:raid") {
            /** @type {import("../unichat").UniChatEventRaid['data']} */
            const data = event.data;

            htmlTemplate = enrichMessage(RAID_TEMPLATE, data);
            htmlTemplate = htmlTemplate.replace("{raid_meta}", enrichMessage(RAID_TEMPLATE_MESSAGE, data));
        }

        if (htmlTemplate != null && MAIN_CONTAINER.querySelector(`div[data-id="${event.data.messageId}"]`) == null) {
            $(MAIN_CONTAINER).append(htmlTemplate);
        }
    }

    if(isAtBottom) {
        MAIN_CONTAINER.scrollTop = MAIN_CONTAINER.scrollHeight;
    }

    requestAnimationFrame(removeChildren);
});
