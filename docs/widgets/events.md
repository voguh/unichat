# Events

Here you will find the documentation for events received via the `unichat:event` listener.

Every event follows the pattern:
```json
{
    "type": "<event-type>",
    "data": {
        // event data
    }
}
```

!> The TypeScript typings can be found in [`unichat.d.ts`](https://github.com/voguh/unichat/blob/main/widgets/unichat.d.ts) or in the `widgets/unichat.d.ts` folder inside the UniChat installation directory.

---

## `unichat:clear`

This event is fired by UniChat or by an integration (scraper).

By default, only the Twitch integration fires this event (result of the `/clear` chat command).

### Event data

| Property   | Type               | Description                                         |
|------------|--------------------|-----------------------------------------------------|
| `platform` | `string` \| `null` | Origin platform.<br/>Empty if fired by **UniChat**. |
| `timestamp`| `number`           | Timestamp in milliseconds.                          |

### Event example

```json
{
    "type": "unichat:clear",
    "data": {
        "platform": "twitch",

        "timestamp": 1616161616161
    }
}
```

---

## `unichat:remove_message`

This event is fired when a message is removed from the chat by moderation or by the user.

### Event data

| Property     | Type               | Description                                              |
|--------------|--------------------|----------------------------------------------------------|
| `channelId`  | `string`           | Channel ID.                                              |
| `channelName`| `string` \| `null` | Channel name.<br/>On YouTube this field is always empty. |
| `platform`   | `string`           | Origin platform.                                         |
| `flags`      | `object`           | Object containing additional flags.                      |
| `messageId`  | `string`           | Removed message ID.                                      |
| `timestamp`  | `number`           | Timestamp in milliseconds.                               |

### Event example

```json
{
    "type": "unichat:remove_message",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "messageId": "abcdefg12345",

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

---

## `unichat:remove_author`

This event is fired when a user is removed from the chat by moderation (ban/timeout).

### Event data

| Property     | Type               | Description                                              |
|--------------|--------------------|----------------------------------------------------------|
| `channelId`  | `string`           | Channel ID.                                              |
| `channelName`| `string` \| `null` | Channel name.<br/>On YouTube this field is always empty. |
| `platform`   | `string`           | Origin platform.                                         |
| `flags`      | `object`           | Object containing additional flags.                      |
| `authorId`   | `string`           | User ID.                                                 |
| `timestamp`  | `number`           | Timestamp in milliseconds.                               |

### Event example

```json
{
    "type": "unichat:remove_author",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

---

## `unichat:message`

This event is fired when a new message is received in the chat.

### Event data

| Property               | Type               | Description                                                                                |
|------------------------|--------------------|--------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                   |
| `platform`             | `string`           | Origin platform.                                                                           |
| `flags`                | `object`           | Object containing additional flags.                                                        |
| `authorId`             | `string`           | User ID.                                                                                   |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.    |
| `authorDisplayName`    | `string`           | User display name.                                                                         |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                  |
| `authorProfilePictureUrl` | `string` \| `null` | User profile picture URL.<br/>On Twitch this field is always empty.                     |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>See [UniChatBadge](#unichatbadge) for more information.           |
| `authorType`           | `string`           | User type.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.           |
| `messageId`            | `string`           | Message ID.                                                                                |
| `messageText`          | `string`           | Message text.                                                                              |
| `emotes`               | `UniChatEmote[]`   | List of emotes in the message.<br/>See [UniChatEmote](#unichatemote) for more information. |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                 |

### Event example

```json
{
    "type": "unichat:message",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],
        "authorType": "viewer",

        "messageId": "abcdefg12345",
        "messageText": "Hello, world!",
        "emotes": [],

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

Also, the following special flag is available:

| Property                     | Description                                                                                  |
|------------------------------|----------------------------------------------------------------------------------------------|
| `unichat:twitch_streak_days` | Indicates if the message is a streak message.<br/>Value is the number of days in the streak. |

---

## `unichat:donate`

This event is fired when a donation (e.g., superchat on YouTube or bits on Twitch) is received in the chat.

### Event data

| Property               | Type               | Description                                                                                                       |
|------------------------|--------------------|-------------------------------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                                       |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                                          |
| `platform`             | `string`           | Origin platform.                                                                                                  |
| `flags`                | `object`           | Object containing additional flags.                                                                               |
| `authorId`             | `string`           | User ID.                                                                                                          |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.                           |
| `authorDisplayName`    | `string`           | User display name.                                                                                                |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                                         |
| `authorProfilePictureUrl` | `string` \| `null` | User profile picture URL.<br/>On Twitch this field is always empty.                                            |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>See [UniChatBadge](#unichatbadge) for more information.                                  |
| `authorType`           | `string`           | User type.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.                                  |
| `value`                | `number`           | Donation amount.                                                                                                  |
| `currency`             | `string`           | Donation currency.<br/>On YouTube this field is the superchat currency.<br/>On Twitch the value is always `bits`. |
| `messageId`            | `string`           | Message ID.                                                                                                       |
| `messageText`          | `string`           | Message text.                                                                                                     |
| `emotes`               | `UniChatEmote[]`   | List of emotes in the message.<br/>See [UniChatEmote](#unichatemote) for more information.                        |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                                        |

### Event example

```json
{
    "type": "unichat:donate",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],
        "authorType": "viewer",

        "value": 500,
        "currency": "bits",

        "messageId": "abcdefg12345",
        "messageText": "Great stream!",
        "emotes": [],

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

### YouTube Special Flags

YouTube event receives could receive additional flags in the `flags` object.

| Property                                               | Description                                                           |
|--------------------------------------------------------|-----------------------------------------------------------------------|
| `unichat:youtube_super_sticker`                        | Indicates if the donation is a super sticker. Value is always `null`. |
| `unichat:youtube_superchat_tier`                       | Tier of the superchat (e.g.: `"1"`, `"2"`, ..., `"7"` or `null`).     |
| `unichat:youtube_superchat_primary_background_color`   | Primary background color of the superchat in rgba format.             |
| `unichat:youtube_superchat_primary_text_color`         | Primary text color of the superchat in rgba format.                   |
| `unichat:youtube_superchat_secondary_background_color` | Secondary background color of the superchat in rgba format.           |
| `unichat:youtube_superchat_secondary_text_color`       | Secondary text color of the superchat in rgba format.                 |

---

## `unichat:sponsor`

This event is fired when a new sponsor (member on YouTube or sub on Twitch, for example) is added to the channel.

### Event data

| Property               | Type               | Description                                                                                                                      |
|------------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                                                      |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                                                         |
| `platform`             | `string`           | Origin platform.                                                                                                                 |
| `flags`                | `object`           | Object containing additional flags.                                                                                              |
| `authorId`             | `string`           | User ID.                                                                                                                         |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.                                          |
| `authorDisplayName`    | `string`           | User display name.                                                                                                               |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                                                        |
| `authorProfilePictureUrl` | `string`        | User profile picture URL.<br/>On Twitch this field is always empty.                                                              |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>See [UniChatBadge](#unichatbadge) for more information.                                                 |
| `authorType`           | `string`           | User type.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.                                                 |
| `tier`                 | `string` \| `null` | Sponsor tier.<br/>On YouTube this field **may** be empty.<br/>On Twitch this field is always `prime`, `1000`, `2000`, or `3000`. |
| `count`                | `number`           | Subscription duration.<br/>On YouTube this field can be `0` when the count could not be determined.                              |
| `messageId`            | `string`           | Message ID.                                                                                                                      |
| `messageText`          | `string` \| `null` | Message text.<br/>On YouTube this field **may** be empty.                                                                        |
| `emotes`               | `UniChatEmote[]`   | List of emotes in the message.<br/>See [UniChatEmote](#unichatemote) for more information.                                       |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                                                       |

### Event example

```json
{
    "type": "unichat:sponsor",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],
        "authorType": "viewer",

        "tier": "1000",
        "months": 3,

        "messageId": "abcdefg12345",
        "messageText": "Happy to support!",
        "emotes": [],

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

---

## `unichat:sponsor_gift`

This event is fired when a gift subscription (e.g., Twitch gift sub) is made on the channel.

### Event data

| Property               | Type               | Description                                                                                                                      |
|------------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                                                      |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                                                         |
| `platform`             | `string`           | Origin platform.                                                                                                                 |
| `flags`                | `object`           | Object containing additional flags.                                                                                              |
| `authorId`             | `string`           | User ID.                                                                                                                         |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.                                          |
| `authorDisplayName`    | `string`           | User display name.                                                                                                               |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                                                        |
| `authorProfilePictureUrl` | `string`        | User profile picture URL.<br/>On Twitch this field is always empty.                                                              |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>See [UniChatBadge](#unichatbadge) for more information.                                                 |
| `authorType`           | `string`           | User type.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.                                                 |
| `tier`                 | `string` \| `null` | Sponsor tier.<br/>On YouTube this field **may** be empty.<br/>On Twitch this field is always `prime`, `1000`, `2000`, or `3000`. |
| `count`                | `number`           | Number of gift subscriptions made.                                                                                               |
| `messageId`            | `string`           | Message ID.                                                                                                                      |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                                                       |

### Event example

```json
{
    "type": "unichat:sponsor_gift",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],
        "authorType": "viewer",

        "tier": "1000",
        "count": 5,

        "messageId": "abcdefg12345",

        "timestamp": 1616161616161
    }
}
```

### Twitch Special Flags

Twitch event receives additional flags in the `flags` object. All IRC tags are mapped to flags and prefixed with `unichat:raw:twitch:`.

---

## `unichat:raid`

This event is fired when a raid (audience redirect) occurs on the channel.

### Event data

| Property               | Type               | Description                                                                                                                  |
|------------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                                                  |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                                                     |
| `platform`             | `string`           | Origin platform.                                                                                                             |
| `flags`                | `object`           | Object containing additional flags.                                                                                          |
| `authorId`             | `string`           | User ID.<br/>On YouTube this field is always empty.                                                                          |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.                                      |
| `authorDisplayName`    | `string`           | User display name.                                                                                                           |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                                                    |
| `authorProfilePictureUrl` | `string`        | User profile picture URL.<br/>On Twitch this field is always empty.                                                          |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>On YouTube this field is an empty list.<br/>See [UniChatBadge](#unichatbadge) for more information. |
| `authorType`           | `string` \| `null` | User type.<br/>On YouTube this field is always empty.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.  |
| `viewerCount`          | `number`           | Number of viewers that arrived.<br/>On YouTube this field is always empty.                                                   |
| `messageId`            | `string`           | Message ID.                                                                                                                  |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                                                   |

### Event example

```json
{
    "type": "unichat:raid",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],

        "authorType": "viewer",
        "viewerCount": 50,

        "messageId": "abcdefg12345",

        "timestamp": 1616161616161
    }
}
```

### Flags Especiais da Twitch

Eventos da twitch recebem flags adicionais no objeto `flags`. Todas as tags do IRC são mapeadas para flags e prefixadas com `unichat:raw:twitch:`;

---

## `unichat:redemption`

This event is fired when a custom reward is redeemed on the channel.

### Event data

| Property               | Type               | Description                                                                                                                        |
|------------------------|--------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `channelId`            | `string`           | Channel ID.                                                                                                                        |
| `channelName`          | `string` \| `null` | Channel name.<br/>On YouTube this field is always empty.                                                                           |
| `platform`             | `string`           | Origin platform.                                                                                                                   |
| `flags`                | `object`           | Object containing additional flags.                                                                                                |
| `authorId`             | `string`           | User ID.                                                                                                                           |
| `authorUsername`       | `string` \| `null` | Username.<br/>On YouTube this field is empty when the username does not start with `@`.                                            |
| `authorDisplayName`    | `string`           | User display name.                                                                                                                 |
| `authorDisplayColor`   | `string`           | User display color in hexadecimal format.                                                                                          |
| `authorProfilePictureUrl` | `string`        | User profile picture URL.<br/>On Twitch this field is always empty.                                                                |
| `authorBadges`         | `UniChatBadge[]`   | List of user badges.<br/>On Twitch this field is always an empty list.<br/>See [UniChatBadge](#unichatbadge) for more information. |
| `authorType`           | `string` \| `null` | User type.<br/>On Twitch this field is always empty.<br/>See [UniChatAuthorType](#unichatauthortype) for more information.         |
| `rewardId`             | `string`           | Custom reward ID.                                                                                                                  |
| `rewardTitle`          | `string`           | Custom reward title.                                                                                                               |
| `rewardDescription`    | `string` \| `null` | Custom reward description.<br/>May be empty if the creator did not set a description.                                              |
| `rewardCost`           | `number`           | Custom reward cost.                                                                                                                |
| `rewardIconUrl`        | `string`           | Custom reward icon URL.                                                                                                            |
| `messageId`            | `string`           | Message ID.                                                                                                                        |
| `messageText`          | `string` \| `null` | Message text.<br/>May be empty if the reward does not involve user input.                                                          |
| `emotes`               | `UniChatEmote[]`   | List of emotes in the message.<br/>See [UniChatEmote](#unichatemote) for more information.                                         |
| `timestamp`            | `number`           | Timestamp in milliseconds.                                                                                                         |

### Event example

```json
{
    "type": "unichat:redemption",
    "data": {
        "channelId": "123456789",
        "channelName": "example_channel",
        "platform": "twitch",
        "flags": {},

        "authorId": "user12345",
        "authorUsername": "example_user",
        "authorDisplayName": "ExampleUser",
        "authorDisplayColor": "#1E90FF",
        "authorProfilePictureUrl": "",
        "authorBadges": [],
        "authorType": "viewer",

        "rewardId": "reward12345",
        "rewardTitle": "Shoutout",
        "rewardDescription": "Get a shoutout from the streamer!",
        "rewardCost": 100,
        "rewardIconUrl": "https://example.com/reward-icon.png",

        "messageId": "abcdefg12345",
        "messageText": "Hello everyone!",
        "emotes": [],

        "timestamp": 1616161616161
    }
}
```

---

## UniChatEmote

Represents an emote present in a chat message.

### Properties

| Property | Type     | Description      |
|----------|----------|------------------|
| `id`     | `string` | Emote ID.        |
| `name`   | `string` | Emote name.      |
| `url`    | `string` | Emote image URL. |

---

## UniChatBadge

Represents a user's badge.

### Properties

| Property | Type     | Description      |
|----------|----------|------------------|
| `code`   | `string` | Badge code.      |
| `url`    | `string` | Badge image URL. |

---

## UniChatAuthorType

Represents a chat author's (user's) type.

### Possible values

| Value         | Description           |
|---------------|-----------------------|
| `VIEWER`      | Regular user.         |
| `SPONSOR`     | Sponsor (member/sub). |
| `VIP`         | Channel VIP user.     |
| `MODERATOR`   | Channel moderator.    |
| `BROADCASTER` | Channel owner.        |

!> Custom values are possible; the values listed here follow the standard API.
