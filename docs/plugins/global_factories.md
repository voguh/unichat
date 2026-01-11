# Global Factories

These are globally available factories to help plugin developers create common objects used in **UniChat**.

---

## UniChatPlatform

This is a global available as `UniChatPlatform`.
It is a factory to fill in the platform name.

Example usage:
```lua
local platform = UniChatPlatform:Twitch();
print(platform);  -- Output: twitch

local platform2 = UniChatPlatform:YouTube();
print(platform2);  -- Output: youtube

local platform3 = UniChatPlatform:Other("KiCk");
print(platform3);  -- Output: kick
```

#### Functions
- `UniChatPlatform:Twitch()`: Returns a `string` with the value `twitch`.
- `UniChatPlatform:YouTube()`: Returns a `string` with the value `youtube`.
- `UniChatPlatform:Other(name)`: Returns a `string` with the value of `name` normalized to lowercase.

---

## UniChatAuthorType

This is a global available as `UniChatAuthorType`.
It is a factory to fill in the user type.

Example usage:
```lua
local type1 = UniChatAuthorType:Viewer();
print(type1);  -- Output: VIEWER

local type2 = UniChatAuthorType:Broadcaster();
print(type2);  -- Output: BROADCASTER

local type3 = UniChatAuthorType:Other("mycustomtype");
print(type3);  -- Output: MYCUSTOMTYPE
```

#### Functions
- `UniChatAuthorType:Viewer()`: Returns a `string` with the value `VIEWER`.
- `UniChatAuthorType:Sponsor()`: Returns a `string` with the value `SPONSOR`.
- `UniChatAuthorType:Vip()`: Returns a `string` with the value `VIP`.
- `UniChatAuthorType:Moderator()`: Returns a `string` with the value `MODERATOR`.
- `UniChatAuthorType:Broadcaster()`: Returns a `string` with the value `BROADCASTER`.
- `UniChatAuthorType:Other(name)`: Returns a `string` with the value of `name` normalized to uppercase.

---

## UniChatEvent

This is a global available as `UniChatEvent`.
It is a factory to create events.

Example usage:
```lua
local event = UniChatEvent:Message({
  -- event data
});
```

#### Functions
- `UniChatEvent:Clear(data)`: Returns a `userdata` representing the [`unichat:clear`](/widgets/events?id=unichatclear) event.
- `UniChatEvent:RemoveMessage(data)`: Returns a `userdata` representing the [`unichat:removemessage`](/widgets/events?id=unichatremovemessage) event.
- `UniChatEvent:RemoveAuthor(data)`: Returns a `userdata` representing the [`unichat:removeauthor`](/widgets/events?id=unichatremoveauthor) event.
- `UniChatEvent:Message(data)`: Returns a `userdata` representing the [`unichat:message`](/widgets/events?id=unichatmessage) event.
- `UniChatEvent:Donate(data)`: Returns a `userdata` representing the [`unichat:donate`](/widgets/events?id=unichatdonate) event.
- `UniChatEvent:Sponsor(data)`: Returns a `userdata` representing the [`unichat:sponsor`](/widgets/events?id=unichatsponsor) event.
- `UniChatEvent:SponsorGift(data)`: Returns a `userdata` representing the [`unichat:sponsor_gift`](/widgets/events?id=unichatsponsor_gift) event.
- `UniChatEvent:Raid(data)`: Returns a `userdata` representing the [`unichat:raid`](/widgets/events?id=unichatraid) event.
- `UniChatEvent:Redemption(data)`: Returns a `userdata` representing the [`unichat:redemption`](/widgets/events?id=unichatredemption) event.
- `UniChatEvent:Custom(data)`: Returns a `userdata` representing a custom event (`unichat:custom`).

!> All functions accept a `data` table that must follow the pattern of the respective event.

---

## UniChatEmote

This is a global available as `UniChatEmote`.
It is a factory to create emotes.

Example usage:
```lua
local emote = UniChatEmote:new(id, name, url);
```

#### Functions
- `UniChatEmote:new(id, name, url)`: Returns a table following the [`UniChatEmote`](/widgets/events?id=unichatemote) pattern.
  | Argument | Type     | Description            |
  |----------|----------|------------------------|
  | id       | `string` | Emote ID.              |
  | name     | `string` | Emote name.            |
  | url      | `string` | Emote image URL.       |

!> The returned table is immutable (read-only).

---

## UniChatBadge

This is a global available as `UniChatBadge`.
It is a factory to create badges.

Example usage:
```lua
local badge = UniChatBadge:new(code, url);
```

#### Functions
- `UniChatBadge:new(code, url)`: Returns a table following the [`UniChatBadge`](/widgets/events?id=unichatbadge) pattern.
  | Argument | Type     | Description            |
  |----------|----------|------------------------|
  | code     | `string` | Badge code.            |
  | url      | `string` | Badge image URL.       |

!> The returned table is immutable (read-only).
