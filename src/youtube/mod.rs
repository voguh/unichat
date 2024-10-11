use std::{fs, io::Write};

use serde_json::Value;
use tauri::Manager;

use crate::events;

pub const SCRAPPING_JS: &str = r#"
    if (window.fetch.__WRAPPED__ == null) {
        function buildMessageRaw(runs) {
            return runs.map((run) => {
                if ('text' in run) {
                    return run.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
                } else {
                    return run.emoji.searchTerms[0]
                }
            }).join(' ').trim()
        }

        function buildEmotes(runs) {
            return runs.map((run) => {
                if ('emoji' in run) {
                    return {
                        type: run.emoji.searchTerms[0],
                        tooltip: run.emoji.searchTerms[0],
                        url: run.emoji.image.thumbnails.at(-1).url
                    }
                }
            }).filter((e) => e)
        }

        function buildBadges(badges) {
            return (badges ?? []).map((badge) => {
                const render = badge.liveChatAuthorBadgeRenderer

                if ('customThumbnail' in render) {
                    return {
                        type: 'sponsor',
                        tooltip: render.tooltip,
                        url: render.customThumbnail.thumbnails.at(-1).url
                    }
                } else if (render.icon.iconType.toLowerCase() === 'moderator') {
                    return {
                        type: 'moderator',
                        tooltip: render.tooltip,
                        url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1'
                    }
                } else if (render.icon.iconType.toLowerCase() === 'verified') {
                    return {
                        type: 'verified',
                        tooltip: render.tooltip,
                        url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1'
                    }
                } else if (render.icon.iconType.toLowerCase() === 'owner') {
                    return {
                        type: 'broadcaster',
                        tooltip: render.tooltip,
                        url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1'
                    }
                }
            }).filter((e) => e)
        }

        function getUserTypeByBadges(badges) {
            if (badges.some((badge) => badge.type === 'broadcaster')) {
                return 'BROADCASTER'
            } else if (badges.some((badge) => badge.type === 'moderator')) {
                return 'MODERATOR'
            } else if (badges.some((badge) => badge.type === 'sponsor')) {
                return 'SPONSOR'
            } else {
                return 'VIEWER'
            }
        }

        function getUserColorByBadges(badges) {
            if (badges.some((badge) => badge.type === 'broadcaster')) {
                return '#ffd600'
            } else if (badges.some((badge) => badge.type === 'moderator')) {
                return '#5e84f1'
            } else if (badges.some((badge) => badge.type === 'sponsor')) {
                return '#2ba640'
            } else {
                return '#ffffffb2'
            }
        }

        function youtubeiToUnichatEvent(action) {
            if ('addChatItemAction' in action) {
                const item = action.addChatItemAction.item

                if ('liveChatTextMessageRenderer' in item) {
                    const payload = item.liveChatTextMessageRenderer
                    const badges = buildBadges(payload.authorBadges)

                    return {
                        type: 'unichat:message',
                        detail: {
                            channelId: null,
                            channelName: null,
                            platform: 'youtube',

                            messageId: payload.id,
                            messageText: buildMessageHtml(payload.message.runs),
                            emotes: buildEmotes(payload.message.runs),

                            authorId: payload.authorExternalChannelId,
                            authorUsername: null,
                            authorDisplayName: payload.authorName.simpleText,
                            authorDisplayColor: getUserColorByBadges(badges),
                            authorProfilePictureUrl: payload.authorPhoto.thumbnails.at(-1).url,
                            authorBadges: badges,
                            authorType: getUserTypeByBadges(badges),

                            timestamp: parseInt(payload.timestampUsec, 10)
                        }
                    }
                }
            } else if ('removeChatItemAction' in action) {
                const payload = action.removeChatItemAction

                if (payload != null) {
                    return {
                        type: 'unichat:remove_message',
                        detail: {
                            channelId: null,
                            channelName: null,
                            platform: 'youtube',

                            messageId: payload.targetItemId
                        }
                    }
                }
            } else if ('removeChatItemByAuthorAction' in action) {
                const payload = action.removeChatItemByAuthorAction

                if (payload != null) {
                    return {
                        type: 'unichat:remove_user',
                        detail: {
                            channelId: null,
                            channelName: null,
                            platform: 'youtube',

                            authorId: payload.externalChannelId
                        }
                    }
                }
            } else if ('addBannerToLiveChatCommand' in action) {
                const payload = action.addBannerToLiveChatCommand

                if (payload != null) {
                    const bannerType = payload.bannerRenderer.liveChatBannerRenderer.bannerType

                    if (bannerType === 'LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT') {
                        const render = payload.bannerRenderer.liveChatBannerRenderer.contents.liveChatBannerRedirectRenderer

                        if ('bold' in render.bannerMessage.runs[0]) {
                            const raider = render.bannerMessage.runs[0].text.trim()

                            return {
                                type: 'unichat:raid',
                                detail: {
                                    channelId: null,
                                    channelName: null,
                                    platform: 'youtube',

                                    authorId: '',
                                    authorUsername: '',
                                    authorDisplayName: raider,
                                    authorProfilePictureUrl: render.authorPhoto.thumbnails.at(-1).url,

                                    viewerCount: -1
                                }
                            }
                        }
                    }
                }
            }
        }

        const originalFetch = window.fetch
        Object.defineProperty(window, "fetch", {
            value: async (...args) => {
                const res = await originalFetch(...args)

                if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                    res.clone().json().then(async (parsed) => {
                        const actions = parsed?.continuationContents?.liveChatContinuation?.actions

                        if (actions != null && actions.length > 0) {
                            await window.__TAURI__.core.invoke('on_youtube_message', { actionsRaw: actions, actions: actions.map(action => youtubeiToUnichatEvent(action)).filter(e => e) })
                        }
                    }).catch(err => console.error(err))
                }

                return res
            },
            configurable: true,
            writable: true
        })

        Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true })
    } else {
        console.log("Fetch already was wrapped!")
    }
"#;

#[tauri::command]
pub async fn on_youtube_message<R: tauri::Runtime>(app: tauri::AppHandle<R>, actions: Vec<Value>, actions_raw: Vec<Value>) -> Result<(), String> {
    for action in actions.clone() {
        if let Err(err) = events::INSTANCE.lock().unwrap().tx.send(action) {
            println!("An error occurred on send youtube action: {err}")
        }
    }

    #[cfg(debug_assertions)] {
        let events_path = app.path().app_data_dir().unwrap().join("events.txt");
        for action_raw in &actions_raw {
            let mut file = fs::OpenOptions::new().append(true).create(true).open(&events_path).unwrap();
            writeln!(file, "{action_raw}").unwrap();
        }

        let events_parsed_path = app.path().app_data_dir().unwrap().join("events-parsed.txt");
        for action in actions {
            let mut file = fs::OpenOptions::new().append(true).create(true).open(&events_parsed_path).unwrap();
            writeln!(file, "{action}").unwrap();
        }
    }

    Ok(())
}
