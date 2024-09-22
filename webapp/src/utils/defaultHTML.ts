export const defaultHTML = `
<div id="main-container" class="sl__chat__layout"></div>

<script type="text/template" id="chatlist_item">
  <div class="message-item" data-from="{from}" data-id="{messageId}">
    <div class="meta" style="background:{color}">
      <span class="name">{from}</span>
      <span class="badges"></span>
    </div>
    <div class="message">{message}</div>
  </div>
</script>
`
