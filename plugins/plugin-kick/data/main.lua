--[[
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
--]]

local UniChatJSON = require("unichat:json");
local logger = require("unichat:logger");

local function validate_kick_url(url)
    return url;
end

-- ============================================================================================== --

local function handle_message_event(data)
    logger.info("Kick Chat Message Event Received: {}", UniChatJSON.encode(data));
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
