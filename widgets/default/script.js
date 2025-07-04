let INITIAL_DATA = {};
let FIRST_LOAD = false;
const MAIN_CONTAINER = document.querySelector("#main-container");
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML;
const DONATE_TEMPLATE = document.querySelector("#donate_item").innerHTML;
const SPONSOR_TEMPLATE = document.querySelector("#sponsor_item").innerHTML;
const SPONSOR_GIFT_TEMPLATE = document.querySelector("#sponsor-gift_item").innerHTML;
const RAID_TEMPLATE = document.querySelector("#raid_item").innerHTML;

function buildBadges(badges) {
  let badgeJoin = ''

  for (const badge of badges) {
    badgeJoin+=`\n<img src="${badge.url}" class="badge" type="${badge.type}" />`
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

function removeChildren() {
  if(MAIN_CONTAINER.children > 50) {
    MAIN_CONTAINER.firstChild.remove();
    requestAnimationFrame(removeChildren);
  }
}

window.addEventListener("unichat:load", function ({ detail: data }) {
    INITIAL_DATA = data;

    if (FIRST_LOAD === false) {
        FIRST_LOAD = true;
        MAIN_CONTAINER.style.setProperty("--maximum-width", window.innerWidth + "px");
    }
});

window.addEventListener("unichat:event", function ({ detail: event }) {
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
        htmlTemplate = htmlTemplate.replace("{donate_meta}", `Just tipped <span class="value">${data.currency} ${data.value}</span>!`);
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
        if (data.months != null) {
            const message = `${msgBegin} for <span>${data.months}</span> months<br/>with tier <span>${data.tier}</span>!`;
            htmlTemplate = htmlTemplate.replace("{sponsor_meta}", message);
        } else {
            const message = `${msgBegin} with tier <span>${data.tier}</span>!`;
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
            message += `<span>${data.count} ${data.platform === "youtube" ? "memberships": "subscriptions"}</span>`;
        } else {
            message += `<span>${data.count} ${data.platform === "youtube" ? "membership": "subscription"}</span>`;
        }
        if (data.tier) {
            message += `with tier ${data.tier}`;
        }
        htmlTemplate = htmlTemplate.replaceAll("{message}", `${message}!`);

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

    requestAnimationFrame(removeChildren);
});
