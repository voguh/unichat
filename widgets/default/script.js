const USE_PLATFORM_BADGES = false;
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

function removeChildren() {
  if(MAIN_CONTAINER.children > 50) {
    MAIN_CONTAINER.firstChild.remove();
    requestAnimationFrame(removeChildren);
  }
}

// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", function () {
    if (FIRST_LOAD === false) {
        FIRST_LOAD = true;
        MAIN_CONTAINER.style.setProperty("--maximum-width", window.innerWidth + "px");
    }
});

window.addEventListener("unichat:event", function ({ detail: event }) {
    if (USE_PLATFORM_BADGES === true && event != null && event.data != null && Array.isArray(event.data.authorBadges)) {
        let imgUrl;
        if (event.data.platform === "youtube") {
            imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVNSURBVHgB7ZxPaBRXGMC/tzWB3TRJQQ/ZhJalJWRbLKZC2hwKMRV76aHZk720FNqTUrCXttBKE6SF3vTQnDyIXvS08eApqIkgSALJHjxsFHURYnKIkH9m0eiO75vJaFzjuu/N7Mz3Zr4fjDvjZGGZ33zvm3nve09AFfm9/QfgmTUkBHwrDzPANIICblZFjOSKN0rbTwh3J5858J5oKf8NFhwDJjhE5aT1qGUkV5pYtg/xH1tGqnxV7vYCEwYFayM5iFISeGRHBssIk17R8ggdgMhn+zMiYd0DJnSsyrPBhGzDhoGhgXhnKCGfpvYBQwJ8spU5RHDuoEMmAQwpWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxWAgxdoFBNLW2yu1dpe9srq3LbQ1MoaFC8AImuzog1dVpX0hna5XHaed8m3OMuP/nkupMQyNBSSjL3l99VdrG/MKrnw8W7H38m/L8YkMF+ypkd99+SB8cgD3yMyVFuBebIk60bf2+zqqTfbW/i0JWirftbeHyJDycngG/EGOffGGBR1BE9ujPtog4gtFz/ccjdiR5xXNS/+j7w/DlmdHYykCwuT00noceeVN6xVOThVHRc8T7j4gKWXktMC/dPXsedNGOEEy6LON1Pv39GLRnu0EXbSF+hGdU2fvHr6CLlhCMjg+GvgFmZzCf6j5hagnZ/Xl8E3i9vK95w2oJSX81AExtdPOIXpPV1di36Cig+xqgJcTLU0Rc0L1plYVwdNSPTn+cupBOFlIvya4AhCQ5QuomkAhpVhyP8Is75y740nkXJE1t6u8iykJ2hdSljt3c2KN6f+wSmEKTxs1rVFLHbu7ZP0/A+Nc5I8SkgsghFAadXDG4mdaMvQ11IW3h5JCdwCgZP5QjKyaQpE4RFIP55Y6HcQgqGNlk7QQ2Yzf/O0kqvwSUQ+g0WTvh5he/xriDJrKFckvTM6Tzy5uIfOWim1/m/j8NJhCLUlJsxoqjp414f4lVba+bX6Z++Q2oYlRtr1fwCfHDHw7b5TpUiY0QLOjDShnK5a1I5IVgmev+f44bM7AWWSHYbfHZv8eNK3GNnBBsknqO/iSbqO8gbDbX1actKAvBlyyq4Y85AnMFlTyxubKu+pVoRIhpeaIW6hGCs4r6gARYjoR1tFTzRCBNFgUo5Yla4FQ5VZSFbK6GN4HSfbGjlCdq4c5RVEFZSDmkntM9EcoTtVAW8mRNPQz9IGvgfBSdCFHuXAyzyTINnXEYZSGrc7eBqY+nGvPZlYXohGFcwXnsqmiNh7CUt7Mydwt00BKy5OPKBVFF96bVErJa1LMfJ5amZkEHLSELV64BU5vFK5Ogg3YO4WbrzSxNzQTbZCGmlNWEwexfJ0AXbSEYISzldYrymnh5CvVUBoS1TizlJShjbtTb9fBlvSzs+MPx67hOCMWcgSL8yKu+CHFBMR0HB6C9pxvaP+42ootcB1xRbmN+0RaweHnS1wccX4VU46yv2LG19mL6RQS9+NzWlY4TJN3K+u1rMTaK6nbePbbXYtwaWMLOQeyPwh7up7JT1Vl70aA1F6tx1ibc+vHT4BlelZQYzkqi0e7+54WUicFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiMFCiIFCSsAQwSok5HDhRWCIIAoJqIgxYEhgVcRIIle8MSGj5BQwoWJZcEq6KDlJvfnxMLZfwISDBQUoJ4dx1xaSKxSWreYngxwpwYORYZWTg7nSxDIei+o/yGf7MyAqw0LAPnm6F5hGUJIiLoIlxjBlbD/xHKvO4EPhUUECAAAAAElFTkSuQmCC";
        } else if (event.data.platform === "twitch") {
            imgUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQuSURBVHgB7dw/aBRpGMfx5x1PvV2Xu5Nwd3JEyOEhWGUt5a5IzkILQcE/hY1txEa3sRAxwcomJoWQ0rSKoGBjo1solq6VIFEDiRDUYJC4Maj7Os/ESFw3k13Hed/f7P4+EMy6i8V+931nZ955NVJnoO9RnzXmgIjZHz7sEUpDRYypmNrHobHyjsmVT5jlX072PfhtIdh0Tqw9KeRM+OEfydfeDo2Ud87p4yhIFMPk74S/FoV8qORstV+jBPooGhmM4VOxutRATHjM6LEmeCbknbG1/qBmgkEhCPplKggPIr1CIMx+PYbw2IGjJxCCwiBgGAQMg4BhEDAMAoZBwDAIGAYBwyBgGAQMg4D5SQD8f3CzHDnxu2TFmaNPZXbmg6TBe5B9x7qiH1ridcpijG95C8IYjXmZsuJi3L72Wip35wXF9mLe6QfHeZBjp7fIrj2/rPr81MSiPH64ICi6tqwXl5xOWWvFIEcjJL8pkIHzf0XDn+KlHkRjlC52S/c/PwutLdUpq+vP9YzRotRGSK6wNDJcHxSzLrURki+sY4zvAHEtKwmNXhru/urvrlx6KQ/vrX4uczz8gtG9beOXx7Mz72W4NC0IMh9E1Y/EfCF+4OfCLxqoo5eX38EwCBgGAcMgYBgEDIOAYRAwDAKGQcAwCJi2uHRSf49Udb4mWZX5IHphUG9cawXKhcRGOGWBYRAwDBJDl6Bd38zHIKtYvh/A9bpJW3zL+tF0NbF0cWvDhS69szKtO98Vg9SJi3FzfDb6SRODrKB3VR4+8Ye3GIpBPtMYeqtrI65iKAaR+B1cLmOojg8StzVi/MKM3L/1RlyCC6JTx/be3Jqv0y0LcW+Wfuq3btsQ909IrrBOiv8VGj7nI4aCC9L0HfJGVn3DkuzO0guTY2efe9uj0nZTVpI9KBpjuDQl0xOL4ktbnaknibF0O6nfGKotRkjSDUHLMdI8A29W5oMk3RCEFENlespKuiEILYbK7AhJejUWMYbKbJAkG0inJ95Fy7iIa+8dtx6CHEN11KUTPZG8eukF9F0pHRNEY+jlEHQdEURX+XTfYRakFqQ6/1GGT01Jq3Yf2iy9/xaaem0z/1GNTk/TT/yefbcitSAL4RvxPRfodu39tanXuV6ncCWTU5ZOPzo62lHmgvhap3AlU+ch7R5DZWKEIKxTuAI/QjophoIOgrJo5BLslIV6NTZtkCOkU2MouBESxRh/1ZExFFyQdjz7bgX3h4BhEDAMAoZBwDAIGAYBwyBgGAQMg4BhEDAMAoZBwGiQSSEIVqQSiLU3hCAYayuBEXtdCELYYigYK+8oh6NkVMgzOxq2mIwO6ouycTD8oyLkSyVnFwb1lyjI5fLfc4t2Qz9Hig92NGer/SPlnXP6yNQ/PdD3qKcmMmgk6A2fLQqlwE6GX6lu6PE7OmSs8AlVHYVcur2kEQAAAABJRU5ErkJggg==";
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
        const tier = data.platform === "twitch" && data.tier.toLowerCase() !== "prime" ? parseInt(data.tier) / 1000 : data.tier;
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
            if (data.platform === "twitch" && data.tier.toLowerCase() !== "prime") {
                message += `with tier ${parseInt(data.tier) / 1000}`;
            } else {
                message += `with tier ${data.tier}`;
            }
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

    requestAnimationFrame(removeChildren);
});
