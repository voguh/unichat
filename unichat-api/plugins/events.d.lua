--[[
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
--]]

---@alias UniChatPlatform "twitch" | "youtube" | string
---@alias UniChatAuthorType "VIEWER" | "SPONSOR" | "MODERATOR" | "BROADCASTER" | string

---@class UniChatEmote
---@field id string
---@field code string
---@field url string

---@class UniChatBadge
---@field code string
---@field url string

---@alias UniChatEvent
---| UniChatEventClear
---| UniChatEventRemoveMessage
---| UniChatEventRemoveAuthor
---| UniChatEventMessage
---| UniChatEventDonate
---| UniChatEventSponsor
---| UniChatEventSponsorGift
---| UniChatEventRaid
---| UniChatEventRedemption
---| UniChatEventCheer
---| UniChatEventUserstoreUpdate
---| UniChatEventCustom

-- ========================================================================= ---

---@class UniChatEventClear
---@field type "unichat:clear"
---@field data UniChatClearEventPayload

---@class UniChatClearEventPayload
---@field platform? UniChatPlatform
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventRemoveMessage
---@field type "unichat:remove_message"
---@field data UniChatRemoveMessageEventPayload

---@class UniChatRemoveMessageEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field messageId string
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventRemoveAuthor
---@field type "unichat:remove_author"
---@field data UniChatRemoveAuthorEventPayload

---@class UniChatRemoveAuthorEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventMessage
---@field type "unichat:message"
---@field data UniChatMessageEventPayload

---@class UniChatMessageEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field messageId string
---@field messageText string
---@field emotes UniChatEmote[]
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventDonate
---@field type "unichat:donate"
---@field data UniChatDonateEventPayload

---@class UniChatDonateEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field value number
---@field currency string
---@field originalValue? number
---@field originalCurrency? string
---@field messageId string
---@field messageText? string
---@field emotes UniChatEmote[]
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventSponsor
---@field type "unichat:sponsor"
---@field data UniChatSponsorEventPayload

---@class UniChatSponsorEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field tier? string
---@field months number
---@field messageId string
---@field messageText? string
---@field emotes UniChatEmote[]
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventSponsorGift
---@field type "unichat:sponsor_gift"
---@field data UniChatSponsorGiftEventPayload

---@class UniChatSponsorGiftEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field messageId string
---@field tier? string
---@field count number
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventRaid
---@field type "unichat:raid"
---@field data UniChatRaidEventPayload

---@class UniChatRaidEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field messageId string
---@field viewerCount? number
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventRedemption
---@field type "unichat:redemption"
---@field data UniChatRedemptionEventPayload

---@class UniChatRedemptionEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field rewardId string
---@field rewardTitle string
---@field rewardDescription? string
---@field rewardCost number
---@field rewardIconUrl? string
---@field messageId string
---@field messageText? string
---@field emotes UniChatEmote[]
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventCheer
---@field type "unichat:cheer"
---@field data UniChatCheerEventPayload

---@class UniChatCheerEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType UniChatAuthorType
---@field value? number
---@field currency? string
---@field cheerId? string
---@field cheerTitle? string
---@field cheerDescription? string
---@field cheerIconUrl? string
---@field messageId string
---@field messageText? string
---@field emotes UniChatEmote[]
---@field timestamp number

-- ========================================================================= ---

---@class UniChatEventUserstoreUpdate
---@field type "unichat:userstore_update"
---@field data UniChatUserstoreUpdateEventPayload

---@class UniChatUserstoreUpdateEventPayload
---@field key string
---@field value? string

-- ========================================================================= ---

---@class UniChatEventCustom
---@field type "unichat:custom"
---@field data table<string, unknown>
