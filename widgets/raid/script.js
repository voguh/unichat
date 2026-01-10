const RAID_MESSAGE = "Is arriving with {viewer_count} viewers!";
const RAID_SOUND_URL = "https://www.myinstants.com/media/sounds/america-ya-hallo.mp3";
const RAID_DISPLAY_DELAY = 0; // in milliseconds (1 second = 1000 milliseconds)
const RAID_DISPLAY_DURATION = 8000; // in milliseconds (1 second = 1000 milliseconds)
const ONLY_FOR_YOUTUBE = true;

/* ================================================================================================================== */

const MAIN_CONTAINER = document.querySelector("#main-container");
const RAIDER_INFO_TEMPLATE = document.querySelector("#raider_info").innerHTML;

function parseTierName(platform, tier) {
    if (platform === "twitch" && tier.toLowerCase() !== "prime") {
        return parseInt(tier, 10) / 1000
    }

    return tier;
}

function enrichMessage(message, params) {
    let richMessage = message;
    for (const key in params) {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (key === "tier") {
            const tierName = parseTierName(params.platform, params.tier);
            richMessage = richMessage.replaceAll(`{${key}}`, tierName).replace(`{${snakeKey}}`, tierName);
        } else if (key === "viewerCount") {
            const viewerCount = params[key] ?? "their";
            richMessage = richMessage.replaceAll(`{${key}}`, viewerCount).replace(`{${snakeKey}}`, viewerCount);
        } else {
            richMessage = richMessage.replaceAll(`{${key}}`, params[key]).replace(`{${snakeKey}}`, params[key]);
        }
    }

    return richMessage;
}

let idle = true;
const queue = [];
async function processQueue() {
    try {
        /** @type {import("../unichat").UniChatEventRaid} */
        const event = queue.shift();
        if (event == null) {
            return;
        }

        idle = false;
        const data = event.data;

        if (data.authorProfilePictureUrl == null && data.platform === "twitch") {
            const authorProfilePictureUrl = await fetch(`https://decapi.me/twitch/avatar/${data.authorUsername}`);
            if (authorProfilePictureUrl.ok) {
                data.authorProfilePictureUrl = await authorProfilePictureUrl.text();
            }
        }

        let htmlTemplate = RAIDER_INFO_TEMPLATE;
        htmlTemplate = enrichMessage(htmlTemplate, data);
        htmlTemplate = htmlTemplate.replace("{message}", enrichMessage(RAID_MESSAGE, data));

        const sfx = new Audio(RAID_SOUND_URL);
        sfx.play().catch(console.error);

        if (RAID_DISPLAY_DELAY > 0) {
            await new Promise(resolve => setTimeout(resolve, RAID_DISPLAY_DELAY));
        }

        if (MAIN_CONTAINER != null) {
            MAIN_CONTAINER.replaceChildren();
            MAIN_CONTAINER.insertAdjacentHTML("beforeend", htmlTemplate);

            if (RAID_DISPLAY_DURATION > 0) {
                await new Promise(resolve => setTimeout(resolve, RAID_DISPLAY_DURATION));
            }

            const raiderInfo = MAIN_CONTAINER.querySelector(".raider-info");
            raiderInfo.classList.add("fade-out");
        }
    } finally {
        if (queue.length !== 0) {
            requestAnimationFrame(processQueue);
        } else {
            idle = true;
        }
    }
}

// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", async function () {
    // This listener doesn't receive any data, actually it just notifies
    // that connection is established or re-established.
});

window.addEventListener("unichat:event", function ({ detail: event }) {
    if (event.type === "unichat:raid" && (ONLY_FOR_YOUTUBE ? event.data.platform === "youtube" : true)) {
        queue.push(event);
        if (queue.length === 1 && idle) {
            requestAnimationFrame(processQueue)
        }
    }
});
