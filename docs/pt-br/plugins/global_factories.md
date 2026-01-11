# Fábricas Globais

Estas são fábricas globalmente disponíveis para ajudar os desenvolvedores de plugins a criar objetos comuns usados no **UniChat**.

---

## UniChatPlatform

Esta é uma global disponível como `UniChatPlatform`.
Ela é uma `factory` para preencher o nome da plataforma.

Exemplo de uso:
```lua
local platform = UniChatPlatform:Twitch();
print(platform);  -- Output: twitch

local platform2 = UniChatPlatform:YouTube();
print(platform2);  -- Output: youtube

local platform3 = UniChatPlatform:Other("KiCk");
print(platform3);  -- Output: kick
```

#### Funções
- `UniChatPlatform:Twitch)`: Retorna uma `string` com o valor `twitch`.
- `UniChatPlatform:YouTube()`: Retorna uma `string` com o valor `youtube`.
- `UniChatPlatform:Other(name)`: Retorna uma `string` com o valor de `name` normalizado em minúsculas.

---

## UniChatAuthorType

Esta é uma global disponível como `UniChatAuthorType`.
Ela é uma `factory` para preencher o tipo do usuário.

Exemplo de uso:
```lua
local type1 = UniChatAuthorType:Viewer();
print(type1);  -- Output: VIEWER

local type2 = UniChatAuthorType:Broadcaster();
print(type2);  -- Output: BROADCASTER

local type3 = UniChatAuthorType:Other("mycustomtype");
print(type3);  -- Output: MYCUSTOMTYPE
```

#### Funções
- `UniChatAuthorType:Viewer()`: Retorna uma `string` com o valor `VIEWER`.
- `UniChatAuthorType:Sponsor()`: Retorna uma `string` com o valor `SPONSOR`.
- `UniChatAuthorType:Vip()`: Retorna uma `string` com o valor `VIP`.
- `UniChatAuthorType:Moderator()`: Retorna uma `string` com o valor `MODERATOR`.
- `UniChatAuthorType:Broadcaster()`: Retorna uma `string` com o valor `BROADCASTER`.
- `UniChatAuthorType:Other(name)`: Retorna uma `string` com o valor de `name` normalizado em maiúsculas.

---

## UniChatEvent

Esta é uma global disponível como `UniChatEvent`.
Ela é uma `factory` para criar os eventos.

Exemplo de uso:
```lua
local event = UniChatEvent:Message({
  -- event data
});
```

#### Funções
- `UniChatEvent:Clear(data)`: Retorna um `userdata` que representa o evento [`unichat:clear`](/pt-br/widgets/events?id=unichatclear).
- `UniChatEvent:RemoveMessage(data)`: Retorna um `userdata` que representa o evento [`unichat:removemessage`](/pt-br/widgets/events?id=unichatremovemessage).
- `UniChatEvent:RemoveAuthor(data)`: Retorna um `userdata` que representa o evento [`unichat:removeauthor`](/pt-br/widgets/events?id=unichatremoveauthor).
- `UniChatEvent:Message(data)`: Retorna um `userdata` que representa o evento [`unichat:message`](/pt-br/widgets/events?id=unichatmessage).
- `UniChatEvent:Donate(data)`: Retorna um `userdata` que representa o evento [`unichat:donate`](/pt-br/widgets/events?id=unichatdonate).
- `UniChatEvent:Sponsor(data)`: Retorna um `userdata` que representa o evento [`unichat:sponsor`](/pt-br/widgets/events?id=unichatsponsor).
- `UniChatEvent:SponsorGift(data)`: Retorna um `userdata` que representa o evento [`unichat:sponsor_gift`](/pt-br/widgets/events?id=unichatsponsor_gift).
- `UniChatEvent:Raid(data)`: Retorna um `userdata` que representa o evento [`unichat:raid`](/pt-br/widgets/events?id=unichatraid).
- `UniChatEvent:Redemption(data)`: Retorna um `userdata` que representa o evento [`unichat:redemption`](/pt-br/widgets/events?id=unichatredemption).
- `UniChatEvent:Custom(data)`: Retorna um `userdata` que representa um evento customizado (`unichat:custom`).

!> Todas as funções aceitam uma tabela `data` que deve seguir o padrão do respectivo evento.

---

## UniChatEmote

Esta é uma global disponível como `UniChatEmote`.
Ela é uma `factory` para criar emotes.

Exemplo de uso:
```lua
local emote = UniChatEmote:new(id, name, url);
```

#### Funções
- `UniChatEvent:new(id, name, url)`: Retorna uma tabela seguindo o padrão do [`UniChatEmote`](/pt-br/widgets/events?id=unichatemote).
  | Argumento | Tipo     | Descrição               |
  |-----------|----------|-------------------------|
  | id        | `string` | ID do emote.            |
  | name      | `string` | Nome do emote.          |
  | url       | `string` | URL da imagem do emote. |

!> A tabela retornada é imutável (read-only).

---

## UniChatBadge

Esta é uma global disponível como `UniChatBadge`.
Ela é uma `factory` para criar badges.

Exemplo de uso:
```lua
local badge = UniChatBadge:new(code, url);
```

#### Funções
- `UniChatBadge:new(code, url)`: Retorna uma tabela seguindo o padrão do [`UniChatBadge`](/pt-br/widgets/events?id=unichatbadge).
  | Argumento | Tipo     | Descrição               |
  |-----------|----------|-------------------------|
  | code      | `string` | Código do badge.        |
  | url       | `string` | URL da imagem do badge. |

!> A tabela retornada é imutável (read-only).
