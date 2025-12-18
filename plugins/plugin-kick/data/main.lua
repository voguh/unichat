--[[
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
--]]

local JSON = require("unichat:json");
local logger = require("unichat:logger");
local time = require("unichat:time");

local function validate_kick_url(url)
    return url;
end

-- ============================================================================================== --

local static_badges_urls = {
    moderator = "/assets/"..__plugin_name.."/moderator.svg",
    broadcaster = "/assets/"..__plugin_name.."/broadcaster.svg",
}

local function parse_author_badges(raw_badges)
    local badges = {};

    for _, badge in ipairs(raw_badges or {}) do
        local badge_type = badge.type;
        local badge_url = static_badges_urls[badge_type];
        if badge_url ~= nil then
            table.insert(badges, {
                code = badge_type,
                url = badge_url,
            })
        end
    end

    return badges;
end

local function parse_author_type(badges)
    for _, badge in ipairs(badges or {}) do
        local badge_type = badge.type;
        if badge_type == "broadcaster" then
            return UniChatAuthorType:Broadcaster();
        elseif badge_type == "moderator" then
            return UniChatAuthorType:Moderator();
        elseif badge_type == "vip" then
            return UniChatAuthorType:Vip();
        elseif badge_type == "sponsor" then
            return UniChatAuthorType:Sponsor();
        end
    end

    return UniChatAuthorType:Viewer();
end

local function parse_message_text(raw_content)
    local message_text = "";

    for word in string.gmatch(raw_content, "%S+") do
        local _, id, name = word:match("^%[(%w+):(%d+):([%w_]+)%]$")

        if id ~= nil and name ~= nil then
            message_text = message_text .. " :" .. name .. ": ";
        else
            message_text = message_text .. " " .. word .. " ";
        end
    end

    return message_text;
end

local function parse_emotes(raw_content)
    local emotes = {};

    for word in string.gmatch(raw_content, "%S+") do
        local _, id, name = word:match("^%[(%w+):(%d+):([%w_]+)%]$")

        if id ~= nil and name ~= nil then
            table.insert(emotes, {
                id = id,
                code = ":" .. name .. ":",
                url = "https://files.kick.com/emotes/" .. id .. "/fullsize",
            });
        end
    end

    return emotes;
end

local function handle_message_event(data)
    local event = UniChatEvent:Message({
        channelId = tostring(data.chatroom_id),
        channelName = nil,

        platform = UniChatPlatform:Other("kick"),
        flags = {
            ["unichat:experimental"] = nil
        },

        authorId = tostring(data.sender.id),
        authorUsername = data.sender.username,
        authorDisplayName = data.sender.slug,
        authorDisplayColor = data.sender.identity.color,
        authorProfilePictureUrl = nil,
        authorBadges = parse_author_badges(data.sender.identity.badges),
        authorType = parse_author_type(data.sender.identity.badges),

        messageId = data.id,
        messageText = parse_message_text(data.content),
        emotes = parse_emotes(data.content),

        timestamp = time.parse(data.created_at),
    });

    UniChatAPI:emit_unichat_event(event);
end

local function on_kick_event(event)
    -- Here you can handle the incoming chat event from Kick.
    -- The 'event' parameter is a table containing the chat message data.
    if event.type == "message" then
        handle_message_event(event.data);
    end
end

-- ============================================================================================== --

UniChatAPI:register_scrapper({
    id = "kick-chat",
    name = "Kick",
    editing_tooltip_message = "You can enter just the channel name or one of the following URLs to get the Kick chat:",
    editing_tooltip_urls = {
        "kick.com/popout/{CHANNEL_NAME}/chat",
        "kick.com/{CHANNEL_NAME}",
    },
    placeholder_text = "https://kick.com/popout/{CHANNEL_NAME}/chat",
    badges = { "experimental" },
    icon = "fas fa-video",
    validate_url = validate_kick_url,
    on_event = on_kick_event,
    scrapper_js_path = "static/scrapper.js"
});
