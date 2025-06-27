let INITIAL_DATA = {};
const MAIN_CONTAINER = document.querySelector("#main-container");
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML;

function buildBadges(badges) {
  let badgeJoin = ''

  for (const badge of badges) {
    badgeJoin+=`\n<img src="${badge.url}" class="badge" type="${badge.type}" />`
  }

  return badgeJoin;
}

function buildMessage(message, emotes) {
    let safeMessage = message.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');

    return emotes.reduce((msg, emote) => {
        const escapedEmote = emote.type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\s)(${escapedEmote})(\\s|$)`, 'g');
        return msg.replace(regex, `$1<img src="${emote.url}" />$3`);
    }, safeMessage);
}

function removeChildren() {
  if(MAIN_CONTAINER.children > 50) {
    MAIN_CONTAINER.firstChild.remove();
    requestAnimationFrame(removeChildren);
  }
}

window.addEventListener("unichat:event", function ({ detail: event }) {
    if (event.type === "unichat:init") {
        const data = event.data
        INITIAL_DATA = data;
    } else if (event.type === "unichat:message") {
        const data = event.data
        let message = MESSAGE_TEMPLATE.replaceAll("{author_id}", data.authorId);
        message = message.replaceAll("{message_id}", data.messageId);
        message = message.replaceAll("{platform}", data.platform);
        message = message.replaceAll("{author_color}", data.authorDisplayColor);
        message = message.replaceAll("{badges}", buildBadges(data.authorBadges));
        message = message.replaceAll("{author_display_name}", data.authorDisplayName);
        message = message.replaceAll("{author_color}", data.authorDisplayColor);
        message = message.replaceAll("{message}", buildMessage(data.messageText, data.emotes));

        if (MAIN_CONTAINER.querySelector(`div[data-id=${data.messageId}]`) == null) {
            $(MAIN_CONTAINER).append(message);
        }
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
