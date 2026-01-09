# Módulos Auxiliares do UniChat

### Tabela de Conteúdos
- [UniChat JSON Module](#unichat-json-module)
- [UniChat Logger Module](#unichat-logger-module)
- [UniChat String Module](#unichat-string-module)
- [UniChat Time Module](#unichat-time-module)
- [UniChat Yaml Module](#unichat-yaml-module)
- [UniChatPlatform Global](#unichatplatform)
- [UniChatAuthorType Global](#unichatauthortype)
- [UniChatEvent Global](#unichatevent)
- [UniChatEmote Global](#unichatemote)
- [UniChatBadge Global](#unichatbadge)

---

## UniChat JSON Module

O módulo JSON do **UniChat** está disponível via `require` como `unichat:json`.

Exemplo de uso:
```lua
local json = require("unichat:json");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local json_string = json:encode(data);
print(json_string);  -- Output: {"name":"UniChat","version":"1.0.0"}

local decoded_data = json:decode(json_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Funções

- `json:encode(table)`: Esta função codifica uma tabela Lua em uma string JSON.
  | Argumento | Tipo    | Obrigatório | Descrição                    |
  |-----------|---------|-------------|------------------------------|
  | table     | `table` | SIM         | Tabela Lua a ser codificada. |

- `json:decode(string)`: Esta função decodifica uma string JSON em uma tabela Lua.
  | Argumento | Tipo     | Obrigatório | Descrição                       |
  |-----------|----------|-------------|---------------------------------|
  | string    | `string` | SIM         | String JSON a ser decodificada. |

---

## UniChat Logger Module

O módulo Logger do **UniChat** está disponível via `require` como `unichat:logger`.

Ele utiliza da logica de `parameterized logging` parecida com a biblioteca `slf4j` do Java.
Cada argumento irá sobrescrever o `{}` na mensagem, na ordem que foram passados.
Caso o ultimo argumento seja um erro, ele será logado como stacktrace e não fará parte da substituição.

Exemplo de uso:
```lua
local logger = require("unichat:logger");

logger:info("This is an info message from my plugin.");
logger:warn("This is a warning message from my plugin.");
logger:info("This message was emitted from {}", __PLUGIN_NAME);
```

#### Funções

- `logger:debug(template, ...)`: Loga uma mensagem de depuração.
  | Argumento | Tipo     | Obrigatório | Descrição                                                                      |
  |-----------|----------|-------------|--------------------------------------------------------------------------------|
  | template  | `string` | SIM         | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...       | `any`    | NÃO         | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:info(template, ...)`: Loga uma mensagem de informação.
  | Argumento | Tipo     | Obrigatório | Descrição                                                                      |
  |-----------|----------|-------------|--------------------------------------------------------------------------------|
  | template  | `string` | SIM         | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...       | `any`    | NÃO         | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:warn(template, ...)`: Loga uma mensagem de aviso.
  | Argumento | Tipo     | Obrigatório | Descrição                                                                      |
  |-----------|----------|-------------|--------------------------------------------------------------------------------|
  | template  | `string` | SIM         | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...       | `any`    | NÃO         | Argumentos para substituir os placeholders na mensagem.                        |

- `logger:error(template, ...)`: Loga uma mensagem de erro.
  | Argumento | Tipo     | Obrigatório | Descrição                                                                      |
  |-----------|----------|-------------|--------------------------------------------------------------------------------|
  | template  | `string` | SIM         | Mensagem a ser logada.<br/>Pode conter `{}` para a substituição de argumentos. |
  | ...       | `any`    | NÃO         | Argumentos para substituir os placeholders na mensagem.                        |

---

## UniChat String Module

O módulo String do **UniChat** está disponível via `require` como `unichat:string`.
Este módulo fornece funções utilitárias para manipulação de strings.

#### Funções
- `string:to_upper(str)`: Esta função retorna a string convertida para maiúsculas.
  | Argumento | Tipo     | Obrigatório | Descrição                                |
  |-----------|----------|-------------|------------------------------------------|
  | str       | `string` | SIM         | String a ser convertida para maiúsculas. |

- `string:to_lower(str)`: Esta função retorna a string convertida para minúsculas.
  | Argumento | Tipo     | Obrigatório | Descrição                                |
  |-----------|----------|-------------|------------------------------------------|
  | str       | `string` | SIM         | String a ser convertida para minúsculas. |

- `string:strip_prefix(str, prefix)`: Esta função retorna a string sem o prefixo, se ele existir, caso contrário retorna `nil`.
  | Argumento | Tipo     | Obrigatório | Descrição                               |
  |-----------|----------|-------------|-----------------------------------------|
  | str       | `string` | SIM         | String da qual o prefixo será removido. |
  | prefix    | `string` | SIM         | Prefixo a ser removido da string.       |

- `string:strip_suffix(str, suffix)`: Esta função retorna a string sem o sufixo, se ele existir, caso contrário retorna `nil`.
  | Argumento | Tipo     | Obrigatório | Descrição                              |
  |-----------|----------|-------------|----------------------------------------|
  | str       | `string` | SIM         | String da qual o sufixo será removido. |
  | suffix    | `string` | SIM         | Sufixo a ser removido da string.       |

- `string:starts_with(str, prefix)`: Esta função retorna um `boolean` indicando se a string começa com o prefixo.
  | Argumento | Tipo     | Obrigatório | Descrição                 |
  |-----------|----------|-------------|---------------------------|
  | str       | `string` | SIM         | String a ser verificada.  |
  | prefix    | `string` | SIM         | Prefixo a ser verificado. |

- `string:ends_with(str, suffix)`: Esta função retorna um `boolean` indicando se a string começa com o sufixo.
  | Argumento | Tipo     | Obrigatório | Descrição                 |
  |-----------|----------|-------------|---------------------------|
  | str       | `string` | SIM         | String a ser verificada.  |
  | suffix    | `string` | SIM         | Sufixo a ser verificado.  |

- `string:find(str, substring)`: Esta função retorna o índice (`1-based`) da primeira ocorrência da substring na string, ou `nil` se não for encontrada.
  | Argumento | Tipo     | Obrigatório | Descrição                             |
  |-----------|----------|-------------|---------------------------------------|
  | str       | `string` | SIM         | String a ser pesquisada.              |
  | substring | `string` | SIM         | Substring a ser encontrada na string. |

- `string:rfind(str, substring): number`: Esta função retorna o índice (`1-based`) da última ocorrência da substring na string, ou `nil` se não for encontrada.
  | Argumento | Tipo     | Obrigatório | Descrição                             |
  |-----------|----------|-------------|---------------------------------------|
  | str       | `string` | SIM         | String a ser pesquisada.              |
  | substring | `string` | SIM         | Substring a ser encontrada na string. |

- `string:is_empty(str)`: Esta função retorna um `boolean` indicando se a string está vazia.
  | Argumento | Tipo     | Obrigatório | Descrição                |
  |-----------|----------|-------------|--------------------------|
  | str       | `string` | SIM         | String a ser verificada. |

- `string:trim(str)`: Esta função retorna a string com espaços em branco removidos do início e do fim.
  | Argumento | Tipo     | Obrigatório | Descrição             |
  |-----------|----------|-------------|-----------------------|
  | str       | `string` | SIM         | String a ser trimada. |

- `string:trim_start(str)`: Esta função retorna a string com espaços em branco removidos do início.
  | Argumento | Tipo     | Obrigatório | Descrição             |
  |-----------|----------|-------------|-----------------------|
  | str       | `string` | SIM         | String a ser trimada. |

- `string:trim_end(str)`: Esta função retorna a string com espaços em branco removidos do fim.
  | Argumento | Tipo     | Obrigatório | Descrição             |
  |-----------|----------|-------------|-----------------------|
  | str       | `string` | SIM         | String a ser trimada. |

- `string:to_bytes(str)`: Esta função retorna uma tabela (`number[]`) de bytes representando a string.
  | Argumento | Tipo     | Obrigatório | Descrição                |
  |-----------|----------|-------------|--------------------------|
  | str       | `string` | SIM         | String a ser convertida. |

- `string:from_bytes(bytes)`: Esta função retorna uma string (UTF-8) construída a partir de uma tabela (`number[]`) de bytes.
  | Argumento | Tipo        | Obrigatório | Descrição                         |
  |-----------|-------------|-------------|-----------------------------------|
  | bytes     | `number[]`  | SIM         | Tabela de bytes a ser convertida. |

- `string:chars(str)`: Esta função retorna uma tabela (`string[]`) contendo cada caractere da string.
  | Argumento | Tipo     | Obrigatório | Descrição              |
  |-----------|----------|-------------|------------------------|
  | str       | `string` | SIM         | String a ser dividida. |

- `string:length(str)`: Esta função retorna o comprimento (número de caracteres) da string.
  | Argumento | Tipo     | Obrigatório | Descrição            |
  |-----------|----------|-------------|----------------------|
  | str       | `string` | SIM         | String a ser medida. |

- `string:replace(str, from, to, count)`: Esta função retorna a string com as ocorrências de `from` substituídas por `to`. O número de substituições é limitado por `count` (se fornecido).
  | Argumento | Tipo     | Obrigatório | Descrição                                       |
  |-----------|----------|-------------|-------------------------------------------------|
  | str       | `string` | SIM         | String a ser modificada.                        |
  | from      | `string` | SIM         | Substring a ser substituída.                    |
  | to        | `string` | SIM         | Substring que substituirá a substring original. |
  | count     | `number` | NÃO         | Número máximo de substituições a serem feitas.  |

- `string:contains(str, substring)`: Esta função retorna um `boolean` indicando se a string contém a substring.
  | Argumento | Tipo     | Obrigatório | Descrição                            |
  |-----------|----------|-------------|--------------------------------------|
  | str       | `string` | SIM         | String a ser verificada.             |
  | substring | `string` | SIM         | Substring a ser procurada na string. |

- `string:split(str, delimiter)`: Esta função retorna uma tabela (`string[]`) contendo as partes da string divididas pelo delimitador.
  | Argumento | Tipo     | Obrigatório | Descrição                                |
  |-----------|----------|-------------|------------------------------------------|
  | str       | `string` | SIM         | String a ser dividida.                   |
  | delimiter | `string` | SIM         | Delimitador usado para dividir a string. |

---

## UniChat Time Module

O módulo Time do **UniChat** está disponível via `require` como `unichat:time`.
Este módulo fornece funções utilitárias para manipulação de tempo e datas.

Exemplo de uso:
```lua
local time = require("unichat:time");

local current_timestamp = time:now();
print("Current Timestamp (ms since Unix epoch):", current_timestamp);
```

#### Funções
- `time:now()`: Esta função retorna o timestamp atual em milisegundos desde a época Unix (1 de janeiro de 1970).

---

## UniChat Yaml Module

O módulo Yaml do **UniChat** está disponível via `require` como `unichat:yaml`.
Este módulo fornece funções para codificação e decodificação de dados YAML.

Exemplo de uso:
```lua
local yaml = require("unichat:yaml");

local data = {
    name = "UniChat",
    version = "1.0.0"
};

local yaml_string = yaml:encode(data);
print(yaml_string);
-- Output:
-- name: UniChat
-- version: 1.0.0

local decoded_data = yaml:decode(yaml_string);
print(decoded_data.name);  -- Output: UniChat
```

#### Funções
- `yaml:encode(table)`: Esta função codifica uma tabela Lua em uma string YAML.
  | Argumento | Tipo    | Obrigatório | Descrição                    |
  |-----------|---------|-------------|------------------------------|
  | table     | `table` | SIM         | Tabela Lua a ser codificada. |

- `yaml:decode(string)`: Esta função decodifica uma string YAML em uma tabela Lua.
  | Argumento | Tipo     | Obrigatório | Descrição                       |
  |-----------|----------|-------------|---------------------------------|
  | string    | `string` | SIM         | String YAML a ser decodificada. |

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
  | Argumento | Tipo     | Obrigatório | Descrição               |
  |-----------|----------|-------------|-------------------------|
  | id        | `string` | SIM         | ID do emote.            |
  | name      | `string` | SIM         | Nome do emote.          |
  | url       | `string` | SIM         | URL da imagem do emote. |

!> A tabela retornada é imutável (read-only).

---

## UniChatBadge

Esta é uma global disponível como `UniChatBadge`.
Ela é uma `factory` para criar emotes.

Exemplo de uso:
```lua
local emote = UniChatBadge:new(code, url);
```

#### Funções
- `UniChatBadge:new(code, url)`: Retorna uma tabela seguindo o padrão do [`UniChatBadge`](/pt-br/widgets/events?id=unichatbadge).
  | Argumento | Tipo     | Obrigatório | Descrição               |
  |-----------|----------|-------------|-------------------------|
  | code      | `string` | SIM         | Código do badge.        |
  | url       | `string` | SIM         | URL da imagem do badge. |

!> A tabela retornada é imutável (read-only).
