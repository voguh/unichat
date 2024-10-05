function buildBadges(badges) {
  let badgeJoin = ''

  for (const badge of badges) {
    badgeJoin+=`\n<img src="${badge.url}" class="badge" type="${badge.type}" />`
  }

  return badgeJoin
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
  const MAIN_CONTAINER = document.querySelector("#main-container")
  const MESSAGE_TEMPLATE = document.querySelector("#chatlist_item").innerHTML
  
  const eventSource = new EventSource(`http://localhost:9527/events`)
  eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data)
    if(data.type === "unichat:message") {
      const detail = data.detail
      let message = MESSAGE_TEMPLATE.replaceAll("{author_id}", detail.authorId)
      message = message.replaceAll("{message_id}", detail.messageId)
      message = message.replaceAll("{author_color}", detail.authorDisplayColor)
      message = message.replaceAll("{badges}", buildBadges(detail.authorBadges))
      message = message.replaceAll("{author_display_name}", detail.authorDisplayName)
      message = message.replaceAll("{author_color}", detail.authorDisplayColor)
      message = message.replaceAll("{message}", detail.messageHtml)

      $(MAIN_CONTAINER).append(message)
    }

    requestAnimationFrame(removeChildren)
  }
})
