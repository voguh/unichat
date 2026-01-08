--[[
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
--]]

-- ===========================================[ UniChat Standard Library ]=========================================== --
---@class UniChatAPI
---@field get_version fun(self: UniChatAPI): string
---@field register_scraper fun(self: UniChatAPI, id: string, name: string, scraper_js_path: string, opts?: table)
---@field fetch_shared_emotes fun(self: UniChatAPI, platform: string, channel_id: string)
---@field expose_module fun(self: UniChatAPI, module_name: string, module_table: table)
---@field add_event_listener fun(self: UniChatAPI, callback: function): number
---@field remove_event_listener fun(self: UniChatAPI, listener_id: number)
---@field get_userstore_item fun(self: UniChatAPI, key: string): string?
---@field set_userstore_item fun(self: UniChatAPI, key: string, value: string)

---@class UniChatBadge
---@class UniChatBadgeFactory
---@field new fun(self: UniChatBadgeFactory, code: string, url: string): UniChatBadge

---@class UniChatEmote
---@class UniChatEmoteFactory
---@field new fun(self: UniChatEmoteFactory, id: string, code: string, url: string): UniChatEmote

---@class UniChatPlatform
---@class UniChatPlatformFactory
---@field Twitch fun(self: UniChatPlatformFactory): UniChatPlatform
---@field YouTube fun(self: UniChatPlatformFactory): UniChatPlatform
---@field Other fun(self: UniChatPlatformFactory, name: string): UniChatPlatform

---@class UniChatAuthorType
---@class UniChatAuthorTypeFactory
---@field Viewer fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Sponsor fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Vip fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Moderator fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Broadcaster fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Other fun(self: UniChatAuthorTypeFactory, type_name: string): UniChatAuthorType

---@class UniChatEvent
---@field type string
---@field data table
---@class UniChatEventFactory
---@field Clear fun(self: UniChatEventFactory, data: UniChatClearEventPayload): UniChatEvent
---@field RemoveMessage fun(self: UniChatEventFactory, data: UniChatRemoveMessageEventPayload): UniChatEvent
---@field RemoveAuthor fun(self: UniChatEventFactory, data: UniChatRemoveAuthorEventPayload): UniChatEvent
---@field Message fun(self: UniChatEventFactory, data: UniChatMessageEventPayload): UniChatEvent
---@field Donate fun(self: UniChatEventFactory, data: UniChatDonateEventPayload): UniChatEvent
---@field Sponsor fun(self: UniChatEventFactory, data: UniChatSponsorEventPayload): UniChatEvent
---@field SponsorGift fun(self: UniChatEventFactory, data: UniChatSponsorGiftEventPayload): UniChatEvent
---@field Raid fun(self: UniChatEventFactory, data: UniChatRaidEventPayload): UniChatEvent
---@field Redemption fun(self: UniChatEventFactory, data: UniChatRedemptionEventPayload): UniChatEvent
---@field Other fun(self: UniChatEventFactory, data: table): UniChatEvent

---@class UniChatClearEventPayload
---@field platform? UniChatAuthorType
---@field timestamp number

---@class UniChatRemoveMessageEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field messageId string
---@field timestamp number

---@class UniChatRemoveAuthorEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId string
---@field timestamp number

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
---@field messageId string
---@field messageText? string
---@field emotes UniChatEmote[]
---@field timestamp number

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

---@class UniChatRaidEventPayload
---@field channelId string
---@field channelName? string
---@field platform UniChatPlatform
---@field flags table<string, string|nil>
---@field authorId? string
---@field authorUsername? string
---@field authorDisplayName string
---@field authorDisplayColor string
---@field authorProfilePictureUrl? string
---@field authorBadges UniChatBadge[]
---@field authorType? UniChatAuthorType
---@field messageId string
---@field viewer_count? number
---@field timestamp number

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



---@type string
__PLUGIN_NAME = __PLUGIN_NAME or nil;

---@type string
__PLUGIN_VERSION = __PLUGIN_VERSION or nil;

---@type UniChatAPI
UniChatAPI = UniChatAPI or nil;

---@type UniChatPlatformFactory
UniChatPlatform = UniChatPlatform or nil;

---@type UniChatAuthorTypeFactory
UniChatAuthorType = UniChatAuthorType or nil;

---@type UniChatEventFactory
UniChatEvent = UniChatEvent or nil;

---@type UniChatEmoteFactory
UniChatEmote = UniChatEmote or nil;

---@type UniChatBadgeFactory
UniChatBadge = UniChatBadge or nil;
-- =========================================[ End UniChat Standard Library ]========================================= --

-- =============================================[ UniChat JSON Library ]============================================= --
---@class UniChatJson
---@field encode fun(self: UniChatJson, data: table): string
---@field decode fun(self: UniChatJson, json: string): table
-- ===========================================[ End UniChat JSON Library ]=========================================== --

-- ============================================[ UniChat Logger Library ]============================================ --
---@class UniChatLogger
---@field debug fun(self: UniChatLogger, template: string, ...: unknown)
---@field info fun(self: UniChatLogger, template: string, ...: unknown)
---@field warn fun(self: UniChatLogger, template: string, ...: unknown)
---@field error fun(self: UniChatLogger, template: string, ...: unknown)
-- ==========================================[ End UniChat Logger Library ]========================================== --

-- ============================================[ UniChat String Library ]============================================ --
---@class UniChatStrings
---@field to_upper fun(self: UniChatStrings, str: string): string
---@field to_lower fun(self: UniChatStrings, str: string): string
---@field strip_prefix fun(self: UniChatStrings, str: string, prefix: string): string
---@field strip_suffix fun(self: UniChatStrings, str: string, suffix: string): string
---@field starts_with fun(self: UniChatStrings, str: string, prefix: string): boolean
---@field ends_with fun(self: UniChatStrings, str: string, suffix: string): boolean
---@field find fun(self: UniChatStrings, str: string, substring: string): number?
---@field rfind fun(self: UniChatStrings, str: string, substring: string): number?
---@field is_empty fun(self: UniChatStrings, str: string): boolean
---@field trim fun(self: UniChatStrings, str: string): string
---@field trim_start fun(self: UniChatStrings, str: string): string
---@field trim_end fun(self: UniChatStrings, str: string): string
---@field to_bytes fun(self: UniChatStrings, str: string): number[]
---@field from_bytes fun(self: UniChatStrings, bytes: number[]): string
---@field chars fun(self: UniChatStrings, str: string): string[]
---@field length fun(self: UniChatStrings, str: string): number
---@field replace fun(self: UniChatStrings, str: string, from: string, to: string, count?: number): string
---@field contains fun(self: UniChatStrings, str: string, substring: string): boolean
---@field split fun(self: UniChatStrings, str: string, delimiter: string): string[]
-- ==========================================[ End UniChat String Library ]========================================== --

-- =============================================[ UniChat Time Library ]============================================= --
---@class UniChatTime
---@field now fun(self: UniChatTime): number
-- ===========================================[ End UniChat Time Library ]=========================================== --

-- =============================================[ UniChat YAML Library ]============================================= --
---@class UniChatYaml
---@field encode fun(self: UniChatYaml, data: table): string
---@field decode fun(self: UniChatYaml, yaml: string): table
-- ===========================================[ End UniChat YAML Library ]=========================================== --

