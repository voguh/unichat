---@type UniChatLogger
local logger = require("unichat:logger");
---@type UniChatStrings
local strings = require("unichat:strings");
---@type UniChatTime
local time = require("unichat:time");

local function validate_kick_url(url)
    url = strings:trim(url);
    url = strings:strip_prefix(url, "http://") or strings:strip_prefix(url, "https://") or url;
    url = strings:strip_prefix(url, "www.") or url;

    local channel_name = nil;
    if strings:starts_with(url, "kick.com/") then
        local parts = strings:split(url, "/");
        table.remove(parts, 1);

        local channel_name_or_popout = parts[1] or "";
        if channel_name_or_popout == "popout" then
            channel_name = parts[2];
        else
            channel_name = channel_name_or_popout;
        end
    end

    if channel_name ~= nil then
        return "https://kick.com/popout/" .. channel_name .. "/chat";
    end

    error("Could not extract channel name from Kick URL.");
end

-- ============================================================================================== --

local channel_id = nil;
local static_badges_urls = {
    moderator = "/assets/"..__PLUGIN_NAME.."/moderator.svg",
    broadcaster = "/assets/"..__PLUGIN_NAME.."/broadcaster.svg",
}

local function parse_author_badges(raw_badges)
    local badges = {};

    for _, badge in ipairs(raw_badges or {}) do
        local badge_type = badge.type;
        local badge_url = static_badges_urls[badge_type];
        if badge_url ~= nil then
            table.insert(badges, UniChatBadge:new(badge_type, badge_url));
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
            table.insert(emotes, UniChatEmote:new(id, ":" .. name .. ":", "https://files.kick.com/emotes/" .. id .. "/fullsize"));
        end
    end

    return emotes;
end

local function handle_message_event(data)
    local event = UniChatEvent:Message({
        channelId = assert(channel_id),
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

        timestamp = time:now(),
    });

    return event;
end

local function handle_delete_message_event(data)
    local event = UniChatEvent:RemoveMessage({
        channelId = assert(channel_id),
        channelName = nil,

        platform = UniChatPlatform:Other("kick"),
        flags = {
            ["unichat:experimental"] = nil
        },

        messageId = data.message.id,

        timestamp = time:now()
    })

    return event;
end

local function handle_remove_user_event(data)
    local event = UniChatEvent:RemoveAuthor({
        channelId = assert(channel_id),
        channelName = nil,

        platform = UniChatPlatform:Other("kick"),
        flags = {
            ["unichat:experimental"] = nil
        },

        authorId = tostring(data.user.id),

        timestamp = time:now()
    })

    return event;
end

local function on_kick_ready(event)
    channel_id = event.channelId;
end

local function on_kick_event(event)
    if channel_id == nil then
        logger:warn("Kick scraper received an event before being ready. Ignoring event.");
        return nil;
    end

    if event.type == "chatMessage" then
        return handle_message_event(event.data);
    elseif event.type == "messageDeleted" then
        return handle_delete_message_event(event.data);
    elseif event.type == "userBanned" then
        return handle_remove_user_event(event.data);
    end

    return nil;
end

-- ============================================================================================== --

local opts = {
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

    on_ready = on_kick_ready
}

UniChatAPI:register_scraper("kick-chat", "Kick", "static/scraper.js", opts);
