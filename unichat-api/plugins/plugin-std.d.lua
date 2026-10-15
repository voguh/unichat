--[[
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
--]]

-- ===========================================[ UniChat Standard Library ]=========================================== --
---@class UniChatAPI
---@field get_version fun(self: UniChatAPI): string
---@field register_scraper fun(self: UniChatAPI, id: string, name: string, scraper_js_path: string, on_event: function, opts?: UniChatScraperOptions)
---@field fetch_shared_emotes fun(self: UniChatAPI, platform: string, channel_id: string)
---@field get_shared_emotes fun(self: UniChatAPI): table<string, UniChatEmote>
---@field expose_module fun(self: UniChatAPI, module_name: string, module_table: table)
---@field add_event_listener fun(self: UniChatAPI, callback: function): number
---@field remove_event_listener fun(self: UniChatAPI, listener_id: number)
---@field get_userstore_item fun(self: UniChatAPI, key: string): string?
---@field set_userstore_item fun(self: UniChatAPI, key: string, value: string | nil)
---@field notify fun(self: UniChatAPI, message: string)

---@class UniChatScraperOptions
---@field validate_url fun(url: string): string
---@field editing_tooltip_message? string
---@field editing_tooltip_urls? string[]
---@field placeholder_text? string
---@field badges? string[]
---@field icon? string
---@field on_idle? fun(event: UniChatScraperStatusEvent)
---@field on_ready? fun(event: UniChatScraperStatusEvent)
---@field on_ping? fun(event: UniChatScraperStatusEvent)
---@field on_error? fun(event: UniChatScraperStatusEvent)
---@field on_fatal? fun(event: UniChatScraperStatusEvent)

---@class UniChatScraperStatusEvent
---@field type "idle" | "ready" | "ping" | "error" | "fatal"
---@field scraperId string
---@field timestamp integer
---@field message string?
---@field stack string?

---@class UniChatBadgeFactory
---@field new fun(self: UniChatBadgeFactory, code: string, url: string): UniChatBadge

---@class UniChatEmoteFactory
---@field new fun(self: UniChatEmoteFactory, id: string, code: string, url: string): UniChatEmote

---@class UniChatPlatformFactory
---@field Twitch fun(self: UniChatPlatformFactory): UniChatPlatform
---@field YouTube fun(self: UniChatPlatformFactory): UniChatPlatform
---@field Other fun(self: UniChatPlatformFactory, name: string): UniChatPlatform

---@class UniChatAuthorTypeFactory
---@field Viewer fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Sponsor fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Moderator fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Broadcaster fun(self: UniChatAuthorTypeFactory): UniChatAuthorType
---@field Other fun(self: UniChatAuthorTypeFactory, type_name: string): UniChatAuthorType

---@class UniChatEventFactory
---@field Clear fun(self: UniChatEventFactory, data: UniChatClearEventPayload): UniChatEventClear
---@field RemoveMessage fun(self: UniChatEventFactory, data: UniChatRemoveMessageEventPayload): UniChatEventRemoveMessage
---@field RemoveAuthor fun(self: UniChatEventFactory, data: UniChatRemoveAuthorEventPayload): UniChatEventRemoveAuthor
---@field Message fun(self: UniChatEventFactory, data: UniChatMessageEventPayload): UniChatEventMessage
---@field Donate fun(self: UniChatEventFactory, data: UniChatDonateEventPayload): UniChatEventDonate
---@field Sponsor fun(self: UniChatEventFactory, data: UniChatSponsorEventPayload): UniChatEventSponsor
---@field SponsorGift fun(self: UniChatEventFactory, data: UniChatSponsorGiftEventPayload): UniChatEventSponsorGift
---@field Raid fun(self: UniChatEventFactory, data: UniChatRaidEventPayload): UniChatEventRaid
---@field Redemption fun(self: UniChatEventFactory, data: UniChatRedemptionEventPayload): UniChatEventRedemption
---@field Cheer fun(self: UniChatEventFactory, data: UniChatCheerEventPayload): UniChatEventCheer
---@field Custom fun(self: UniChatEventFactory, data: table): UniChatEventCustom

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

-- ===========================================[ UniChat Currency Library ]=========================================== --
---@class UniChatCurrency
---@field target fun(self: UniChatCurrency): string?
---@field convert fun(self: UniChatCurrency, value: number, token: string): number?, string?
-- =========================================[ End UniChat Currency Library ]========================================= --

-- =============================================[ UniChat HTTP Library ]============================================= --
---@class UniChatBasicAuth
---@field username string
---@field password string

---@class UniChatHttpArgs
---@field headers table<string, string>?
---@field query_params table<string, string>?
---@field content_type string?
---@field basic_auth UniChatBasicAuth?

---@class UniChatHttpResponse
---@field ok boolean
---@field status_code number
---@field status_text string
---@field headers table<string, string>
---@field url string
---@field header fun(self: UniChatHttpResponse, name: string): string?
---@field text fun(self: UniChatHttpResponse): string?
---@field json fun(self: UniChatHttpResponse): table?
---@field bytes fun(self: UniChatHttpResponse): number[]?

---@class UniChatHttp
---@field get fun(self: UniChatHttp, uri: string, args?: UniChatHttpArgs): UniChatHttpResponse
---@field post fun(self: UniChatHttp, uri: string, body: string | table | nil, args?: UniChatHttpArgs): UniChatHttpResponse
---@field put fun(self: UniChatHttp, uri: string, body: string | table | nil, args?: UniChatHttpArgs): UniChatHttpResponse
---@field patch fun(self: UniChatHttp, uri: string, body: string | table | nil, args?: UniChatHttpArgs): UniChatHttpResponse
---@field delete fun(self: UniChatHttp, uri: string, args?: UniChatHttpArgs): UniChatHttpResponse
---@field head fun(self: UniChatHttp, uri: string): UniChatHttpResponse
-- ===========================================[ End UniChat HTTP Library ]=========================================== --

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

-- ============================================[ UniChat Utils Library ]============================================= --
---@class UniChatUtils
---@field random_color_by_seed fun(self: UniChatUtils, seed: string): string
-- ==========================================[ End UniChat Utils Library ]=========================================== --

-- =============================================[ UniChat YAML Library ]============================================= --
---@class UniChatYaml
---@field encode fun(self: UniChatYaml, data: table): string
---@field decode fun(self: UniChatYaml, yaml: string): table
-- ===========================================[ End UniChat YAML Library ]=========================================== --

