const MAIN_CONTAINER = document.querySelector("#main-container")
const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML

function buildBadges(badges) {
  let badgeJoin = ''

  for (const badge of badges) {
    badgeJoin+=`\n<img src="${badge.url}" class="badge" type="${badge.type}" />`
  }

  return badgeJoin
}

function buildMessage(message, emotes) {
    return emotes.reduce((message, emote) => {
        return message.replaceAll(emote.type, `<img src="${emote.url}" />`)
    }, message.replace(/\</g, '&lt;').replace(/\>/g, '&gt;'))
}

function removeChildren() {
  if(MAIN_CONTAINER.children > 50) {
    MAIN_CONTAINER.firstChild.remove()
  }


  if(MAIN_CONTAINER.children > 50) {
    requestAnimationFrame(removeChildren)
  }
}

$(document).ready(function () {
    const socket = new WebSocket('ws://localhost:9527/ws')
    socket.addEventListener("message", function (event) {
        const data = JSON.parse(event.data)
        if (data.type === "unichat:message") {
            const detail = data.detail
            let message = MESSAGE_TEMPLATE.replaceAll("{author_id}", detail.authorId)
            message = message.replaceAll("{message_id}", detail.messageId)
            message = message.replaceAll("{platform}", detail.platform)
            message = message.replaceAll("{author_color}", detail.authorDisplayColor)
            message = message.replaceAll("{badges}", buildBadges(detail.authorBadges))
            message = message.replaceAll("{author_display_name}", detail.authorDisplayName)
            message = message.replaceAll("{author_color}", detail.authorDisplayColor)
            message = message.replaceAll("{message}", buildMessage(detail.messageText, detail.emotes))

            if (MAIN_CONTAINER.querySelector(`div[data-id=${data.messageId}]`) == null) {
                $(MAIN_CONTAINER).append(message)
            }
        } else if (data.type === 'unichat:remove_message') {
            MAIN_CONTAINER.querySelector(`div[data-id="${data.detail.messageId}"]`)?.remove()
        } else if (data.type === 'unichat:remove_user') {
            const messages = MAIN_CONTAINER.querySelectorAll(`div[data-from="${data.detail.authorId}"]`)
            for (const message of (messages ?? [])) {
                message.remove()
            }
        }

        requestAnimationFrame(removeChildren)
    })
})
