# Eventos

### Tabela de Conteúdos
- [`Introdução`](#introdução)
- [`unichat:clear`](#unichatclear)
- [`unichat:remove_message`](#unichatremove_message)
- [`unichat:remove_author`](#unichatremove_author)
- [`unichat:message`](#unichatmessage)
- [`unichat:donate`](#unichatdonate)
- [`unichat:sponsor`](#unichatsponsor)
- [`unichat:sponsor_gift`](#unichatsponsor_gift)
- [`unichat:raid`](#unichatraid)
- [`unichat:redemption`](#unichatredemption)
- [`UniChatEmote`](#unichatemote)
- [`UniChatBadge`](#unichatbadge)
- [`UniChatAuthorType`](#unichatauthortype)

---

## Introdução

Aqui você encontra a documentação dos eventos recebidos via listener `unichat:event`.

Todo evento segue o padrão:
```json
{
    "type": "<event-type>",
    "data": {
        // event data
    }
}
```

!> A tipagem em typescript pode ser encontrada em [`unichat.d.ts`](https://github.com/voguh/unichat/blob/main/widgets/unichat.d.ts) ou na pasta `widgets/unichat.d.ts` na pasta de instalação do UniChat.

---

## `unichat:clear`

Este evento é disparado pelo UniChat ou por alguma integração (scraper).

Por padrão apenas a integração com a twitch dispara este evento (resultado do `/clear` comando do chat).

### Dados do evento

| Propriedade   | Tipo               | Descrição                                                                   |
|---------------|--------------------|-----------------------------------------------------------------------------|
| `platform`    | `string` \| `null` | Plataforma de origem.<br/>Vazio caso tenha sido disparado pelo **UniChat**. |
| `timestamp`   | `number`           | Timestamp em milissegundos.                                                 |

### Exemplo de evento

```json
{
    "type": "unichat:clear",
    "data": {
        "platform": "twitch",

        "timestamp": 1616161616161
    }
}
```

## `unichat:remove_message`

Este evento é disparado quando uma mensagem é removida do chat por moderação ou pelo próprio usuário.

### Dados do evento

| Propriedade   | Tipo               | Descrição                                                |
|---------------|--------------------|----------------------------------------------------------|
| `channelId`   | `string`           | ID do canal.                                             |
| `channelName` | `string` \| `null` | Nome do canal.<br/>No YouTube este campo é sempre vazio. |
| `platform`    | `string`           | Plataforma de origem.                                    |
| `flags`       | `object`           | Objeto contendo flags adicionais.                        |
| `messageId`   | `string`           | ID da mensagem removida.                                 |
| `timestamp`   | `number`           | Timestamp em milissegundos.                              |

### Exemplo de evento

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

## `unichat:remove_author`

Este evento é disparado quando um usuário é removido do chat pela moderação (banimento/timeout).

### Dados do evento

| Propriedade   | Tipo               | Descrição                                                |
|---------------|--------------------|----------------------------------------------------------|
| `channelId`   | `string`           | ID do canal.                                             |
| `channelName` | `string` \| `null` | Nome do canal.<br/>No YouTube este campo é sempre vazio. |
| `platform`    | `string`           | Plataforma de origem.                                    |
| `flags`       | `object`           | Objeto contendo flags adicionais.                        |
| `authorId`    | `string`           | ID do usuário.                                           |
| `timestamp`   | `number`           | Timestamp em milissegundos.                              |

### Exemplo de evento

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

## `unichat:message`

Este evento é disparado quando uma nova mensagem é recebida no chat.

### Dados do evento

| Propriedade               | Tipo               | Descrição                                                                                             |
|---------------------------|--------------------|-------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`           | ID do canal.                                                                                          |
| `channelName`             | `string` \| `null` | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                              |
| `platform`                | `string`           | Plataforma de origem.                                                                                 |
| `flags`                   | `object`           | Objeto contendo flags adicionais.                                                                     |
| `authorId`                | `string`           | ID do usuário.                                                                                        |
| `authorUsername`          | `string` \| `null` | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.       |
| `authorDisplayName`       | `string`           | Nome de exibição do usuário.                                                                          |
| `authorDisplayColor`      | `string`           | Cor de exibição do usuário em formato hexadecimal.                                                    |
| `authorProfilePictureUrl` | `string` \| `null` | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                            |
| `authorBadges`            | `UniChatBadge[]`   | Lista de insígnias do usuário.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações.          |
| `authorType`              | `string`           | Tipo do usuário.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.              |
| `messageId`               | `string`           | ID da mensagem.                                                                                       |
| `messageText`             | `string`           | Texto da mensagem.                                                                                    |
| `emotes`                  | `UniChatEmote[]`   | Lista de emotes presentes na mensagem.<br/>Veja [UniChatEmote](#unichatemote) para mais informações.  |
| `timestamp`               | `number`           | Timestamp em milissegundos.                                                                           |

### Exemplo de evento

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

## `unichat:donate`

Este evento é disparado quando uma doação (superchat no youtube ou bits na twitch, por exemplo) é recebida no chat.

### Dados do evento

| Propriedade               | Tipo               | Descrição                                                                                                    |
|---------------------------|--------------------|--------------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`           | ID do canal.                                                                                                 |
| `channelName`             | `string` \| `null` | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                                     |
| `platform`                | `string`           | Plataforma de origem.                                                                                        |
| `flags`                   | `object`           | Objeto contendo flags adicionais.                                                                            |
| `authorId`                | `string`           | ID do usuário.                                                                                               |
| `authorUsername`          | `string` \| `null` | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.              |
| `authorDisplayName`       | `string`           | Nome de exibição do usuário.                                                                                 |
| `authorDisplayColor`      | `string`           | Cor de exibição do usuário em formato hexadecimal.                                                           |
| `authorProfilePictureUrl` | `string` \| `null` | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                                   |
| `authorBadges`            | `UniChatBadge[]`   | Lista de insígnias do usuário.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações.                 |
| `authorType`              | `string`           | Tipo do usuário.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.                     |
| `value`                   | `number`           | Valor da doação.                                                                                             |
| `currency`                | `string`           | Moeda da doação.<br/>No YouTube este campo é a moeda do super chat.<br/>Na twitch o valor é sempre `bits`.  |
| `messageId`               | `string`           | ID da mensagem.                                                                                              |
| `messageText`             | `string`           | Texto da mensagem.                                                                                           |
| `emotes`                  | `UniChatEmote[]`   | Lista de emotes presentes na mensagem.<br/>Veja [UniChatEmote](#unichatemote) para mais informações.         |
| `timestamp`               | `number`           | Timestamp em milissegundos.                                                                                  |

### Exemplo de evento

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

## `unichat:sponsor`

Este evento é disparado quando um novo patrocinador (membro no youtube ou sub na twitch, por exemplo) é adicionado ao canal.

### Dados do evento

| Propriedade               | Tipo                | Descrição                                                                                                                                  |
|---------------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`            | ID do canal.                                                                                                                               |
| `channelName`             | `string` \| `null`  | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                                                                   |
| `platform`                | `string`            | Plataforma de origem.                                                                                                                      |
| `flags`                   | `object`            | Objeto contendo flags adicionais.                                                                                                          |
| `authorId`                | `string`            | ID do usuário.                                                                                                                             |
| `authorUsername`          | `string` \| `null`  | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.                                            |
| `authorDisplayName`       | `string`            | Nome de exibição do usuário.                                                                                                               |
| `authorDisplayColor`      | `string`            | Cor de exibição do usuário em formato hexadecimal.                                                                                         |
| `authorProfilePictureUrl` | `string`            | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                                                                 |
| `authorBadges`            | `UniChatBadge[]`    | Lista de insígnias do usuário.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações.                                               |
| `authorType`              | `string`            | Tipo do usuário.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.                                                   |
| `tier`                    | `string` \| `null`  | Nível do patrocinador.<br/>No YouTube este campo **pode** ser vazio.<br/>Na twitch este campo é sempre `prime`, `1000`, `2000` ou `3000`.  |
| `count`                   | `number`            | Tempo de assinatura.<br/>No YouTube este campo pode receber o valor `0` no qual indica que não foi possível determinar a contagem.         |
| `messageId`               | `string`            | ID da mensagem.                                                                                                                            |
| `messageText`             | `string` \| `null`  | Texto da mensagem.<br/>No YouTube este campo **pode** ser vazio.                                                                           |
| `emotes`                  | `UniChatEmote[]`    | Lista de emotes presentes na mensagem.<br/>Veja [UniChatEmote](#unichatemote) para mais informações.                                       |
| `timestamp`               | `number`            | Timestamp em milissegundos.                                                                                                                |

### Exemplo de evento

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

## `unichat:sponsor_gift`

Este evento é disparado quando uma assinatura de presente (gift sub na twitch, por exemplo) é realizada no canal.

### Dados do evento

| Propriedade               | Tipo                | Descrição                                                                                                                                  |
|---------------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`            | ID do canal.                                                                                                                               |
| `channelName`             | `string` \| `null`  | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                                                                   |
| `platform`                | `string`            | Plataforma de origem.                                                                                                                      |
| `flags`                   | `object`            | Objeto contendo flags adicionais.                                                                                                          |
| `authorId`                | `string`            | ID do usuário.                                                                                                                             |
| `authorUsername`          | `string` \| `null`  | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.                                            |
| `authorDisplayName`       | `string`            | Nome de exibição do usuário.                                                                                                               |
| `authorDisplayColor`      | `string`            | Cor de exibição do usuário em formato hexadecimal.                                                                                         |
| `authorProfilePictureUrl` | `string`            | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                                                                 |
| `authorBadges`            | `UniChatBadge[]`    | Lista de insígnias do usuário.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações.                                               |
| `authorType`              | `string`            | Tipo do usuário.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.                                                   |
| `tier`                    | `string` \| `null`  | Nível do patrocinador.<br/>No YouTube este campo **pode** ser vazio.<br/>Na twitch este campo é sempre `prime`, `1000`, `2000` ou `3000`.  |
| `count`                   | `number`            | Quantidade de assinaturas de presente realizadas.                                                                                          |
| `messageId`               | `string`            | ID da mensagem.                                                                                                                            |
| `timestamp`               | `number`            | Timestamp em milissegundos.                                                                                                                |

### Exemplo de evento

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

## `unichat:raid`

Este evento é disparado quando uma raid (redirecionamento de público) ocorre no canal.

### Dados do evento

### Dados do evento

| Propriedade               | Tipo                | Descrição                                                                                                                                   |
|---------------------------|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`            | ID do canal.                                                                                                                                |
| `channelName`             | `string` \| `null`  | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                                                                    |
| `platform`                | `string`            | Plataforma de origem.                                                                                                                       |
| `flags`                   | `object`            | Objeto contendo flags adicionais.                                                                                                           |
| `authorId`                | `string`            | ID do usuário.<br/>No YouTube este campo é sempre vazio.                                                                                    |
| `authorUsername`          | `string` \| `null`  | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.                                             |
| `authorDisplayName`       | `string`            | Nome de exibição do usuário.                                                                                                                |
| `authorDisplayColor`      | `string`            | Cor de exibição do usuário em formato hexadecimal.                                                                                          |
| `authorProfilePictureUrl` | `string`            | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                                                                  |
| `authorBadges`            | `UniChatBadge[]`    | Lista de insígnias do usuário.<br/>No YouTube este campo é uma lista vazia.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações.   |
| `authorType`              | `string` \| `null`  | Tipo do usuário.<br/>No YouTube este campo é sempre vazio.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.          |
| `viewerCount`             | `number`            | Quantidade de espectadores que chegaram.<br/>No YouTube este campo é sempre vazio.                                                          |
| `messageId`               | `string`            | ID da mensagem.                                                                                                                             |
| `timestamp`               | `number`            | Timestamp em milissegundos.                                                                                                                 |

### Exemplo de evento

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

## `unichat:redemption`

Este evento é disparado quando uma recompensa personalizada (custom reward) é resgatada no canal.

### Dados do evento

| Propriedade               | Tipo                | Descrição                                                                                                                                       |
|---------------------------|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `channelId`               | `string`            | ID do canal.                                                                                                                                    |
| `channelName`             | `string` \| `null`  | Nome do canal.<br/>No YouTube este campo é sempre vazio.                                                                                        |
| `platform`                | `string`            | Plataforma de origem.                                                                                                                           |
| `flags`                   | `object`            | Objeto contendo flags adicionais.                                                                                                               |
| `authorId`                | `string`            | ID do usuário.                                                                                                                                  |
| `authorUsername`          | `string` \| `null`  | Nome do usuário.<br/>No YouTube este campo é vazio quando o nome do usuário não começa com `@`.                                                 |
| `authorDisplayName`       | `string`            | Nome de exibição do usuário.                                                                                                                    |
| `authorDisplayColor`      | `string`            | Cor de exibição do usuário em formato hexadecimal.                                                                                              |
| `authorProfilePictureUrl` | `string`            | URL da foto de perfil do usuário.<br/>Na Twitch este campo é sempre vazio.                                                                      |
| `authorBadges`            | `UniChatBadge[]`    | Lista de insígnias do usuário.<br/>Na Twitch este campo é sempre uma lista vazia.<br/>Veja [UniChatBadge](#unichatbadge) para mais informações. |
| `authorType`              | `string` \| `null`  | Tipo do usuário.<br/>Na Twitch este campo é sempre vazio.<br/>Veja [UniChatAuthorType](#unichatauthortype) para mais informações.               |
| `rewardId`                | `string`            | ID da recompensa personalizada.                                                                                                                 |
| `rewardTitle`             | `string`            | Título da recompensa personalizada.                                                                                                             |
| `rewardDescription`       | `string` \| `null`  | Descrição da recompensa personalizada.<br/>Pode ser vazio caso o criador não tenha definido uma descrição.                                      |
| `rewardCost`              | `number`            | Custo da recompensa personalizada.                                                                                                              |
| `rewardIconUrl`           | `string`            | URL do ícone da recompensa personalizada.                                                                                                       |
| `messageId`               | `string`            | ID da mensagem.                                                                                                                                 |
| `messageText`             | `string` \| `null`  | Texto da mensagem.<br/>Pode ser vazio caso a recompensa não envolva input do usuário.                                                           |
| `emotes`                  | `UniChatEmote[]`    | Lista de emotes presentes na mensagem.<br/>Veja [UniChatEmote](#unichatemote) para mais informações.                                            |
| `timestamp`               | `number`            | Timestamp em milissegundos.                                                                                                                     |

### Exemplo de evento

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

Representa um emote presente em uma mensagem do chat.

### Propriedades

| Propriedade   | Tipo     | Descrição               |
|---------------|----------|-------------------------|
| `id`          | `string` | ID do emote.            |
| `name`        | `string` | Nome do emote.          |
| `url`         | `string` | URL da imagem do emote. |

---

## UniChatBadge

Representa uma insígnia (badge) de um usuário.

### Propriedades

| Propriedade   | Tipo     | Descrição                  |
|---------------|----------|----------------------------|
| `code`        | `string` | Código da insígnia.        |
| `url`         | `string` | URL da imagem da insígnia. |

---

## UniChatAuthorType

Representa o tipo de um autor (usuário) no chat.

### Valores possíveis

| Valor        | Descrição                  |
|--------------|----------------------------|
| `VIEWER`     | Usuário comum.             |
| `SPONSOR`    | Patrocinador (membro/sub). |
| `VIP`        | Usuário VIP do canal.      |
| `MODERATOR`  | Moderador do canal.        |
| `BROADCASTER`| Dono do canal.             |

!> Valores customizados são possiveis, os valores listados aqui seguem a API padrão.
