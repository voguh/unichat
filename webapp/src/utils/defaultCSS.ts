export const defaultCSS = `
@import url(https://fonts.googleapis.com/css?family=Roboto:700);

:root {
  --font-size: 16px;
  --background-color: #FFFFFF;
  --text-color: #000000;
  --message-hide-delay: 15s;
}

*, html, body {
  box-sizing: border-box;
  font-family: 'Roboto';
  font-size: var(--font-size);
  line-height: 1;
  font-weight: 700;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  background: var(--background-color);
}

#main-container {
  padding: 8px;
  display: table;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  table-layout: fixed;
}

#main-container > .message-item {
  position: relative;
  margin-top: 32px;
  animation: fadeInRight .3s ease forwards, fadeOut 0.5s ease var(--message-hide-delay) forwards;
}

#main-container > .message-item > .meta {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  width: fit-content;
  padding: 8px 16px;
}

#main-container > .message-item > .meta::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 22.63px;
  height: 22.63px;
  background: inherit;
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: center;
}

#main-container > .message-item > .meta::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 22.63px;
  height: 22.63px;
  background: inherit;
  transform: translate(50%, -50%) rotate(45deg);
  transform-origin: center;
}

#main-container > .message-item > .meta > .name {
  font-weight: 700;
  white-space: nowrap;
}

#main-container > .message-item > .meta > .badges {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

#main-container > .message-item > .meta > .badges:empty {
  display: none;
}

#main-container > .message-item > .meta > .badges > img {
  height: var(--font-size);
  width: var(--font-size);
}

#main-container > .message-item > .message {
  background: var(--background-color);
  color: var(--text-color);
  padding: 24px 16px 16px 16px;
  border-radius: 2px;
}

#main-container > .message-item > .message > img {
  height: var(--font-size);
}
`
