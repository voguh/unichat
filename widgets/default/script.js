const MAIN_CONTAINER = document.querySelector("#main-container");
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML;
const DONATE_TEMPLATE = document.querySelector("#donate_item").innerHTML;
const SPONSOR_TEMPLATE = document.querySelector("#sponsor_item").innerHTML;
const RAID_ITEM = document.querySelector("#raid_item").innerHTML;

function buildBadges(badges) {
  let badgeJoin = ''

  for (const badge of badges) {
    badgeJoin+=`\n<img src="${badge.url}" class="badge" type="${badge.type}" />`
  }

  return badgeJoin;
}

function buildMessage(message, emotes) {
    let safeMessage = message.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    if (!emotes || emotes.length === 0) {
        return safeMessage;
    }

    const emotesMap = new Map(emotes.map(emote => [emote.type, emote.url]));
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

window.addEventListener("unichat:event", function ({ detail: event }) {
    if (event.type === "unichat:message") {
        const data = event.data
        let message = MESSAGE_TEMPLATE.replaceAll("{author_id}", data.authorId);
        message = message.replaceAll("{platform}", data.platform);
        message = message.replaceAll("{message_id}", data.messageId);
        message = message.replaceAll("{author_color}", data.authorDisplayColor);
        message = message.replaceAll("{badges}", buildBadges(data.authorBadges));
        message = message.replaceAll("{author_display_name}", data.authorDisplayName);
        message = message.replaceAll("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id=${data.messageId}]`) == null) {
            $(MAIN_CONTAINER).append(message);
        }
    } else if (event.type === "unichat:donate") {
        const data = event.data
        let message = DONATE_TEMPLATE.replaceAll("{author_id}", data.authorId);
        message = message.replaceAll("{platform}", data.platform);
        message = message.replaceAll("{message_id}", data.messageId);
        message = message.replaceAll("{author_color}", data.authorDisplayColor);
        message = message.replaceAll("{badges}", buildBadges(data.authorBadges));
        message = message.replaceAll("{author_display_name}", data.authorDisplayName);
        message = message.replaceAll("{currency}", data.currency);
        message = message.replaceAll("{value}", data.value);
        message = message.replaceAll("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id=${data.messageId}]`) == null) {
            $(MAIN_CONTAINER).append(message);
        }
    } else if (event.type === "unichat:donate") {
        const data = event.data
        let message = SPONSOR_TEMPLATE.replaceAll("{author_id}", data.authorId);
        message = message.replaceAll("{platform}", data.platform);
        message = message.replaceAll("{message_id}", data.messageId);
        message = message.replaceAll("{author_color}", data.authorDisplayColor);
        message = message.replaceAll("{badges}", buildBadges(data.authorBadges));
        message = message.replaceAll("{author_display_name}", data.authorDisplayName);
        message = message.replaceAll("{tier}", data.tier ?? "membership");
        message = message.replaceAll("{value}", data.months);
        message = message.replaceAll("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id=${data.messageId}]`) == null) {
            $(MAIN_CONTAINER).append(message);
        }
    } else if (event.type === "unichat:raid") {
        const data = event.data
        let message = RAID_ITEM.replaceAll("{author_id}", data.authorId);
        message = message.replaceAll("{platform}", data.platform);
        message = message.replaceAll("{message_id}", data.messageId);
        message = message.replaceAll("{message}", `${data.authorDisplayName} is raiding with ${data.viewers ?? 'their'} viewers!`);

        $(MAIN_CONTAINER).append(message);
    } else if (event.type === 'unichat:remove_message') {
        MAIN_CONTAINER.querySelector(`div[data-id="${event.data.messageId}"]`)?.remove();
    } else if (event.type === 'unichat:remove_author') {
        const messages = MAIN_CONTAINER.querySelectorAll(`div[data-from="${event.data.authorId}"]`);
        for (const message of (messages ?? [])) {
            message.remove();
        }
    }

    requestAnimationFrame(removeChildren);
});
