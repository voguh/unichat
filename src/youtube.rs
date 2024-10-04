use serde_json::Value;

use crate::events;

pub const SCRAPPING_JS: &str = r#"
    if (window.fetch.__WRAPPED__ == null) {
        function buildMessageHtml(runs) {
            return runs.map((run) => {
                    if ("text" in run) {
                        return run.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()
                    } else {
                        const emote = run.emoji

                        return `<img src="${emote.image.thumbnails.at(-1).url}" aria-label="${emote.searchTerms[0]}" />`
                    }
                }).join(" ").trim()
        }

        function buildMessageRaw(runs) {
            return runs.map((run) => {
                    if ("text" in run) {
                        return run.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim()
                    } else {
                        return run.emoji.searchTerms[0]
                    }
                }).join(" ").trim()
        }

        function buildEmotes(runs) {
            return runs.map((run) => {
                    if ("emoji" in run) {
                        return {
                            emoteId: run.emoji.emojiId,
                            handler: run.emoji.searchTerms[0],
                            url: run.emoji.image.thumbnails.at(-1).url
                        }
                    }
                }).filter((e) => e)
        }

        function buildBadges(badges) {
            return badges.map((badge) => {
                    const render = badge.liveChatAuthorBadgeRenderer

                    if ("customThumbnail" in render) {
                        return {
                            type: "sponsor",
                            tooltip: render.tooltip,
                            url: render.customThumbnail.thumbnails.at(-1).url
                        }
                    } else if (render.icon.iconType.toLowerCase() === "moderator") {
                        return {
                            type: "moderator",
                            tooltip: render.tooltip,
                            url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1"
                        }
                    } else if (render.icon.iconType.toLowerCase() === "verified") {
                        return {
                            type: "verified",
                            tooltip: render.tooltip,
                            url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1"
                        }
                    } else if (render.icon.iconType.toLowerCase() === "owner") {
                        return {
                            type: "broadcaster",
                            tooltip: render.tooltip,
                            url: "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1"
                        }
                    }
                }).filter((e) => e)
        }

        function getUserTypeByBadges(badges) {
            if (badges.some((badge) => badge.type === "broadcaster")) {
                return "BROADCASTER"
            } else if (badges.some((badge) => badge.type === "moderator")) {
                return "MODERATOR"
            } else if (badges.some((badge) => badge.type === "sponsor")) {
                return "SPONSOR"
            } else {
                return "VIEWER"
            }
        }

        function youtubeiToUnichatEvent(action) {
            if ("addChatItemAction" in action) {
                const payload = action.addChatItemAction.item.liveChatTextMessageRenderer
                const badges = buildBadges(payload.authorBadges)
                const userType = getUserTypeByBadges(badges)

                return {
                    type: "unichat:message",
                    detail: {
                        messageId: payload.id,
                        messageHtml: buildMessageHtml(payload.message.runs),
                        messageRaw: buildMessageRaw(payload.message.runs),
                        emotes: buildEmotes(payload.message.runs),

                        platform: "youtube",

                        authorId: payload.authorExternalChannelId,
                        authorUsername: null,
                        authorDisplayName: payload.authorName.simpleText,
                        authorDisplayColor: userType == 'MODERATOR' ? '#5e84f1' : userType === 'SPONSOR' ? '#2ba640' : userType === 'BROADCASTER' ? '#ffd600' : '#ffffffb2',
                        authorProfilePictureUrl: payload.authorPhoto.thumbnails.at(-1).url,
                        authorBadges: badges,
                        authorType: userType,

                        timestamp: parseInt(payload.timestampUsec, 10)
                    }
                }
            } else if ("removeChatItemAction" in action) {
                const payload = action.removeChatItemAction

                return {
                    type: "unichat:remove_message",
                    detail: { platform: "youtube", messageId: payload.targetItemId }
                }
            }
        }

        const originalFetch = window.fetch;
        Object.defineProperty(window, "fetch", {
            value: async (...args) => {
                const res = await originalFetch(...args);

                if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                    res.clone().json().then(async (parsed) => {
                        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

                        if (actions != null && actions.length > 0) {
                            await window.__TAURI__.core.invoke('on_message', { actions: actions.map(action => youtubeiToUnichatEvent(action)) })
                        }
                    }).catch(err => console.error(err))
                }

                return res;
            },
            configurable: true,
            writable: true
        });

        Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true })
    } else {
        console.log("Fetch already was wrapped!")
    }
"#;

#[tauri::command]
pub async fn on_message(actions: Vec<Value>) -> Result<(), String> {
    for action in actions {
        events::INSTANCE.lock().unwrap().emit("unichat:event", action.to_string().as_str());
    }

    Ok(())
}
